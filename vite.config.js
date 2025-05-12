export default {
    base: "./", // important for Netlify static hosting
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:7088', // your Spring Boot backend
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api'), // optional
            }
        }
    }
};