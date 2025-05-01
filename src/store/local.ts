function getLocalStorage(key: string) {
  return localStorage.getItem(key);
}

function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export { getLocalStorage, setLocalStorage };
