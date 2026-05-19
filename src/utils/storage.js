// Simulamos localStorage con estado en memoria
let memoryStorage = {};

export const getStorage = (key) => {
  return memoryStorage[key] || [];
};

export const setStorage = (key, value) => {
  memoryStorage[key] = value;
};

export const createStorage = (key, initialValue) => {
  if (!memoryStorage[key]) {
    memoryStorage[key] = initialValue;
  }
};

// Los demás archivos se mantienen exactamente igual que antes
// Solo necesitamos cambiar storage.js ya que los componentes 
// ya están abstractos para usar nuestras funciones de storage

// DONE