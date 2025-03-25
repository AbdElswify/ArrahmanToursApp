import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import Sound from 'react-native-sound';

const SoundPlayer = ({ soundFile }) => {
  let sound;

  // Initialize the sound when the component mounts
  useEffect(() => {
    sound = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
      }
    });

    // Cleanup the sound instance when the component unmounts
    return () => {
      if (sound) {
        sound.release();
      }
    };
  }, [soundFile]);

  const playSound = () => {
    if (sound) {
      sound.play((success) => {
        if (!success) {
          console.log('Sound did not play successfully');
        }
      });
    }
  };

  const stopSound = () => {
    if (sound) {
      sound.stop(() => {
        console.log('Sound stopped');
      });
    }
  };

  return (
    <View>
      <Button title="Play Sound" onPress={playSound} />
      <Button title="Stop Sound" onPress={stopSound} />
    </View>
  );
};

export default SoundPlayer;

