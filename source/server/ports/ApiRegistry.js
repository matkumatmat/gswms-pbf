function callApi(action, email, _e, data) {
  try {
    var result;
    if (action === 'login' || action === 'register') {
      result = PostsRegistryV2.execute(action, data);
    } else {
      var user = AuthService.validateRequest(email, _e);
      if (PostsRegistryV2.getHandler(action)) {
        result = PostsRegistryV2.execute(action, data, user);
      } else if (GetsRegistryV2.getHandler(action)) {
        result = GetsRegistryV2.execute(action, data);
      } else {
        throw new Error('Action not found');
      }
    }
    // Bersihkan Date object dan kirim sebagai string JSON
    var cleaned = JSON.parse(JSON.stringify(result, function(key, value) {
      if (value instanceof Date) return value.toISOString();
      return value;
    }));
    return JSON.stringify({ status: 'success', data: cleaned });
  } catch (err) {
    return JSON.stringify({ status: 'error', message: err.message });
  }
}