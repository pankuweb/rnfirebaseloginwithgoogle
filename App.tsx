/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {SafeAreaView, Button} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

function App(): JSX.Element {
  const [userData, setUserData] = useState();
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '787967316627-kl4qimpuqf34tub9f6a74rkulv7g5ot7.apps.googleusercontent.com',
    });
  }, []);

  async function onGoogleButtonPress() {
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
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setUserData();
      console.log('Signout suceess');
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <SafeAreaView>
      {userData ? (
        <Button title="Google Sign-Out" onPress={() => logout()} />
      ) : (
        <Button
          title="Google Sign-In"
          onPress={() =>
            onGoogleButtonPress()
              .then(res => {setUserData(res.additionalUserInfo), console.log(res,'resx')})
              .catch(error => console.log(error, 'error'))
          }
        />
      )}
    </SafeAreaView>
  );
}

export default App;
