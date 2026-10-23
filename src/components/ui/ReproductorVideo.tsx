import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

interface Props {
  url: string;
}

export function ReproductorVideo({ url }: Props) {
  const player = useVideoPlayer(url, (reproductor) => {
    reproductor.loop = false;
    reproductor.pause(); 
  });

  return (
    <View style={styles.contenedor}>
      <VideoView 
        style={styles.video} 
        player={player} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { 
    width: '100%', 
    height: 220, 
    backgroundColor: '#000',
    borderRadius: 12, 
    overflow: 'hidden',
    marginVertical: 16
  },
  video: { 
    width: '100%', 
    height: '100%' 
  }
});