import { StyleSheet, Image, ActivityIndicator, View, Button } from "react-native";
import { Text } from "react-native-paper";
import { router, SplashScreen } from 'expo-router';
import { MixpanelService } from '@/SDK/Mixpanel';
import { useTranslation } from "react-i18next";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { SCREEN_HEIGHT } from "@/constants/Device";
import { OnboardingContainer } from "@/components/OnboardingContainer";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function WelcomeScreen() {

  const { t } = useTranslation();
  const [loadingAuth, setLoadingAuth] = useState(true);

  const redirectToHowMuchTimeScreen = () => {
    router.push('/how-much-time')
    MixpanelService.trackEvent("onboarding_step_1", {
      onboarding_step: 1,
      device_type: "iOS",
      timestamp: new Date().toISOString()
    });
  };

  const testNativeStorage = async () => {
    try {
      await NativeModules.DataService.createLimit("Focus Mode");
      const limits = await NativeModules.DataService.fetchAllLimits();
      console.log("Fetched limits:", limits);
    } catch (error) {
      console.error("Native module error:", error);
    }
  };

  useEffect(() => {
    const hideSplashScreen = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await SplashScreen.hideAsync();
    };
    hideSplashScreen();
  }, []);

  useEffect(() => {
    const validateScreenTimeAccess = async () => {
      const screenTimeAccess = await AsyncStorage.getItem('screenTimeAccess');
      const userIsAuthenticated = !!screenTimeAccess;
      setLoadingAuth(false);
      if (userIsAuthenticated) {
        router.replace('/(tabs)');
      }
    }
    validateScreenTimeAccess();
  }, []);

  if (loadingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    )
  }

  return (
    <OnboardingContainer onPress={redirectToHowMuchTimeScreen} buttonLabel={t('welcomeScreen.startButton')}>
      <Text style={styles.title}>
        {t('welcomeScreen.title')}
      </Text>
      <Image resizeMode="contain" source={require('../assets/images/welcome.png')} style={styles.image} />
      <Text style={styles.subtitle}>
        {t('welcomeScreen.subtitle')}
      </Text>
      {/* TEMPORARY DEBUG BUTTON */}
      <Button title="Test Native Storage" onPress={testNativeStorage} />
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: RFValue(36, SCREEN_HEIGHT),
    fontWeight: '700',
    lineHeight: RFValue(46.8, SCREEN_HEIGHT),
    textAlign: 'center',
    fontFamily: 'Catamaran'
  },
  image: {
    alignSelf: 'center',
    marginTop: hp('5%'),
    height: hp('30%')
  },
  subtitle: {
    fontSize: RFValue(22, SCREEN_HEIGHT),
    fontWeight: '400',
    lineHeight: RFValue(33, SCREEN_HEIGHT),
    textAlign: 'center',
    marginTop: hp('5%'),
    fontFamily: 'Mulish'
  }
});