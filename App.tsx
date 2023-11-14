/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {SafeAreaView, Button, Text, View, TouchableOpacity} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import auth from '@react-native-firebase/auth';
import AzureAuth from 'react-native-azure-auth';
import {firebase} from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyAssoatZp3qTaBsyynuP1MHP1IlkelIawM',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'demoapp-35958',
  storageBucket: 'storage',
  messagingSenderId: '787967316627',
  appId: '1:787967316627:android:c06ff9c6488b3dc2e83366',
  measurementId: 'YOUR_MEASUREMENT_ID',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const AllUserDetails = {
  name: '',
  email: '',
  photo: '',
};

function App(): JSX.Element {
  const azureAuth = new AzureAuth({
    clientId: '19442c9f-b952-452f-ab6f-5a15c2a96dea',
  });
  const [userDetails, setUserDetails] = useState();
  const [userData, setUserData] = useState();
  const [userType, setUserType] = useState();
  const [loginGoogle, setLoginGoogle] = useState(false);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '787967316627-kl4qimpuqf34tub9f6a74rkulv7g5ot7.apps.googleusercontent.com',
    });
  }, []);
  async function onGoogleButtonPress() {
    setLoginGoogle('google');
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    const {idToken} = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    setUserDetails(userCredential.user);

    // details
    AllUserDetails.name = userCredential.user.displayName;
    AllUserDetails.email = userCredential.user.email;

    console.log(userCredential.user, 'userCredential');
    console.log('Successfully logged in with google!');
    setUserType('Google');
    return auth().signInWithCredential(googleCredential);
  }

  const logout = async () => {
    try {
      if (loginGoogle == 'google') {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        setLoginGoogle('');
      } else if(loginGoogle == 'facebook'){
        await LoginManager.logOut();
      }else{
        azureAuth.webAuth.clearSession();
      }

      console.log('Logged out successfully');
      setUserData();
    } catch (error) {
      console.error('Logout failed with error:', error);
    }
  };

  async function onFacebookButtonPress() {
    setLoginGoogle('facebook');
    const result = await LoginManager.logInWithPermissions(['public_profile']);
    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }
    const data = await AccessToken.getCurrentAccessToken();
    console.log(data, 'data===>');
    if (!data) {
      throw 'Something went wrong obtaining access token';
    }
    const facebookCredential = auth.FacebookAuthProvider.credential(
      data.accessToken,
    );
    const response = await fetch(
      `https://graph.facebook.com/v15.0/me?fields=id,name,email,gender,birthday,picture&access_token=${data.accessToken}`,
    );
    const userData = await response.json();
    console.log(userData, 'Successfully logged in with facebook!');

    // details
    AllUserDetails.name = userData.name ? userData.name : 'Not Found';
    AllUserDetails.email = userData.email ? userData.email : 'Not Found';

    setUserType('Facebook');
    return auth().signInWithCredential(facebookCredential);
  }

  const mslogin = async () => {
    try {
      let tokens = await azureAuth.webAuth.authorize({
        scope: 'openid profile User.Read',
      });
      setLoginGoogle('ms');
      setUserData(tokens);
      let info = await azureAuth.auth.msGraphRequest({
        token: tokens.accessToken,
        path: '/me',
      });
      // details
      AllUserDetails.name = info.displayName ? info.displayName : 'Not Found';
      AllUserDetails.email = info.userPrincipalName
        ? info.userPrincipalName
        : 'Not Found';

      console.log(info, 'Successfully logged in with microsoft!');
      setUserType('Microsoft');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView>
      {userData ? (
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Text
            style={{
              marginVertical: 10,
              textAlign: 'center',
              color: '#000',
              fontSize: 16,
              marginBottom: 30,
              fontWeight: 'bold',
            }}>
            {userType} Details
          </Text>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          />
          <Text
            style={{
              marginVertical: 2,
              textAlign: 'center',
              color: '#000',
              fontSize: 16,
            }}>
            Name: {AllUserDetails.name}
          </Text>
          <Text
            style={{
              marginVertical: 2,
              marginBottom: 60,
              textAlign: 'center',
              color: '#000',
              fontSize: 16,
            }}>
            Email: {AllUserDetails.email}
          </Text>
          <Button title="Sign-Out" onPress={() => logout()} />
        </View>
      ) : (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 300,
          }}>
          <TouchableOpacity
            onPress={() =>
              onGoogleButtonPress()
                .then(res => {
                  setUserData(res.additionalUserInfo);
                })
                .catch(error => console.log(error, 'error'))
            }
            style={{
              backgroundColor: 'blue',
              padding: 10,
              borderRadius: 5,
            }}>
            <Text style={{color: 'white'}}>Google Sign-In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              onFacebookButtonPress().then(res =>
                setUserData(res.additionalUserInfo),
              )
            }
            style={{
              backgroundColor: 'blue',
              padding: 10,
              borderRadius: 5,
              marginVertical: 10,
            }}>
            <Text style={{color: 'white'}}>Facebook Sign-In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => mslogin().then(res => console.log(res, 'asdf'))}
            style={{
              backgroundColor: 'blue',
              padding: 10,
              borderRadius: 5,
            }}>
            <Text style={{color: 'white'}}>Microsoft Sign-In</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

export default App;
