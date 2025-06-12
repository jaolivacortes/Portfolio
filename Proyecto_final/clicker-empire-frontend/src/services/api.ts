const API_URL = 'http://127.0.0.1:8000/api';

export const api = {
    getHomeData: async () => {
        try {
            console.log('Intentando obtener datos de:', `${API_URL}/home`);
            const response = await fetch(`${API_URL}/home`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            console.log('Respuesta recibida:', response.status);
            
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Datos recibidos:', data);
            return data;
        } catch (error) {
            console.error('Error detallado al obtener datos:', error);
            throw error;
        }
    }
}; 