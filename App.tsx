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

function App(): JSX.Element {
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
      loginGoogle
        ? (await GoogleSignin.revokeAccess(),
          await GoogleSignin.signOut(),
          setUserData())
        : setUserData();
    } catch (error) {
      console.error(error);
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
        </>
      )}
    </SafeAreaView>
  );
}

export default App;
