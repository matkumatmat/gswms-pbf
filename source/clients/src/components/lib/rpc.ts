declare var google: any;

export const gasApi = {
  call: async (serverFunctionName: string, ...args: any[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        const successHandler = (result: any) => {
          // PARSE PAKSA: jika string, coba parse
          let parsed = result;
          if (typeof result === 'string') {
            try {
              parsed = JSON.parse(result);
            } catch (e) {
              // biarkan sebagai string
            }
          }
          resolve(parsed);
        };
        if (serverFunctionName === 'callApi') {
          google.script.run
            .withSuccessHandler(successHandler)
            .withFailureHandler((error: Error) => reject(error))
            .callApi(args[0], args[1], args[2], args[3]);
        } else {
          google.script.run
            .withSuccessHandler(successHandler)
            .withFailureHandler((error: Error) => reject(error))
            [serverFunctionName](args[0], args[1], args[2], args[3], args[4]);
        }
      } else {
        // Mock
        resolve({ status: 'success', data: [] });
      }
    });
  }
};