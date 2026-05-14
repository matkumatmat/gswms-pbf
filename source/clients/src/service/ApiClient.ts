import { gasApi } from '../components/lib/rpc';

const ApiClient = (() => {
  async function call(action: string, params: Record<string, any> = {}) {
    const auth = localStorage.getItem('pbf_auth');
    let email = '', _e = '';
    if (auth) {
      try {
        const cred = JSON.parse(auth);
        email = cred.email;
        _e = cred._e;
      } catch {}
    }
    const needsAuth = !['login', 'register'].includes(action);
    if (needsAuth && (!email || !_e)) {
      throw new Error('Anda belum login');
    }

    const response = await gasApi.call('callApi', action, email, _e, params);
    // response sekarang sudah objek (bukan string)
    if (response && response.status === 'success') {
      return response.data;
    }
    return response;
  }

  return { call };
})();

export default ApiClient;