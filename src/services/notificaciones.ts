
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuración global del comportamiento de las notificaciones
// cuando la aplicación está abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});



/**
 * Solicita permiso al usuario para enviar notificaciones.
 * Es obligatorio en iOS y en Android 13+.
 */
export async function solicitarPermisoNotificaciones(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E3A8A',
    });
  }

  return finalStatus === 'granted';
}

/**
 * Dispara una notificación inmediata de prueba/evento real.
 */
export async function enviarNotificacionLocal(titulo: string, cuerpo: string) {
  const permiso = await solicitarPermisoNotificaciones();
  if (!permiso) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: cuerpo,
      sound: true,
    },
    trigger: null, // null significa que se dispara instantáneamente
  });
}