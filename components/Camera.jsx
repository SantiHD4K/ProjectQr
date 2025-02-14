import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Modal, Pressable } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scanData, setScanData] = useState({});

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanning) {
      setScanned(true);
      if (isValidJson(data)) {
        const parsedData = JSON.parse(data);
        if (parsedData.id_obj) {
          try {
            const response = await fetch(`http://192.168.81.71:3000/objeto/${parsedData.id_obj}`);
            if (!response.ok) {
              throw new Error('Failed to fetch data');
            }
            const fetchedData = await response.json();
            setScanData(fetchedData);
          } catch (error) {
            setScanData({ error: 'Error al obtener detalles del objeto' });
          }
        } else {
          setScanData({ error: 'Código no válido' });
        }
      } else {
        setScanData({ error: 'Código no válido' });
      }
      setScanning(false);
      setModalVisible(true);
    }
  };

  const isValidJson = (data) => {
    try {
      JSON.parse(data);
      return true;
    } catch (error) {
      return false;
    }
  };

  const startScan = () => {
    setScanned(false);
    setScanning(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setScanData({});
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sin acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <Text style={styles.scanText}>Ubica el QR en el cuadro: </Text>
        <View style={styles.border} />
        <Button
          title={'Escanear Codigo QR'}
          onPress={startScan}
          color="#39A900"
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Detalles del Objeto</Text>
            {scanData.error ? (
              <Text>{scanData.error}</Text>
            ) : (
              <>
                <Text style={styles.modalInfo}><Text style={styles.modalTitle}>Serial:</Text> {scanData.ser_obj}</Text>
                <Text style={styles.modalInfo}><Text style={styles.modalTitle}>Marca:</Text> {scanData.marc_obj}</Text>
                <Text style={styles.modalInfo}><Text style={styles.modalTitle}>Tipo:</Text> {scanData.tip_obj}</Text>
                <Text style={styles.modalInfo}><Text style={styles.modalTitle}>Estado:</Text> {scanData.est_obj}</Text>
                <Text style={styles.modalInfo}><Text style={styles.modalTitle}>Valor:</Text> {scanData.val_obj}</Text>
                <Text style={styles.modalInfo}><Text style={styles.modalTitle}>Observaciones:</Text> {scanData.obser_obj}</Text>
              </>
            )}
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={closeModal}
            >
              <Text style={styles.textStyle}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanText: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  border: {
    height: 350,
    width: 350,
    borderWidth: 2,
    marginBottom: 20,
    borderColor: '#39A900',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 20,
  },
  buttonClose: {
    backgroundColor: '#39A900',
    alignSelf: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  modalInfo: {
    marginBottom: 10,
  },
});

export default CameraScreen;
