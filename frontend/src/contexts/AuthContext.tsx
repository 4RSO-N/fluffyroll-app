  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      console.log('Login response:', response);
      
      await AsyncStorage.setItem('accessToken', response.accessToken);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      // Don't throw error - login was successful!
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };
