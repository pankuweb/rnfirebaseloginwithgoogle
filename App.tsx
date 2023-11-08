/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {SafeAreaView, Button} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import auth from '@react-native-firebase/auth';
import AzureAuth from 'react-native-azure-auth';

function App(): JSX.Element {
  const azureAuth = new AzureAuth({
    clientId: '2258d2d9-225d-431a-9c02-7953265b12f0',
  });

  const [userData, setUserData] = useState();
  const [loginGoogle, setLoginGoogle] = useState(false);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '787967316627-kl4qimpuqf34tub9f6a74rkulv7g5ot7.apps.googleusercontent.com',
    });
  }, []);

  async function onGoogleButtonPress() {
    setLoginGoogle(true);
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    console.log('Signin suceess');
    return auth().signInWithCredential(googleCredential);
  }

  const logout = async () => {
    try {
      if (loginGoogle) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        setLoginGoogle(false);
      } else {
        await LoginManager.logOut();
      }

      // Handle successful logout
      console.log('Logged out successfully');
      setUserData();
    } catch (error) {
      console.error('Logout failed with error:', error);
    }
  };

  async function onFacebookButtonPress() {
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions(['public_profile']);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    // Once signed in, get the users AccessToken
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw 'Something went wrong obtaining access token';
    }

    // Create a Firebase credential with the AccessToken
    const facebookCredential = auth.FacebookAuthProvider.credential(
      data.accessToken,
    );

    // Sign-in the user with the credential
    return auth().signInWithCredential(facebookCredential);
  }

  const newLog = async () => {
    try {
      let tokens = await azureAuth.webAuth.authorize({
        scope: 'openid profile User.Read Mail.Read',
      });
      this.setState({accessToken: tokens.accessToken});
      let info = await azureAuth.auth.msGraphRequest({
        token: tokens.accessToken,
        path: '/me',
      });
      this.setState({user: info.displayName, userId: tokens.userId});
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView>
      {userData ? (
        <Button title="Sign-Out" onPress={() => logout()} />
      ) : (
        <>
          <Button
            title="Google Sign-In"
            onPress={() =>
              onGoogleButtonPress()
                .then(res => {
                  setUserData(res.additionalUserInfo);
                })
                .catch(error => console.log(error, 'error'))
            }
          />
          <Button
            title="Facebook Sign-In"
            onPress={() =>
              onFacebookButtonPress().then(res =>
                setUserData(res.additionalUserInfo),
              )
            }
          />
          <Button
            title="Microsoft Sign-In"
            onPress={() => newLog().then(res => console.log(res, 'asdf'))}
          />
        </>
      )}
    </SafeAreaView>
  );
}

export default App;
