export default {
  esbuild: {
    // Axios ve diğer HTTP kütüphanelerini external olarak işaretle
    external: ["axios"],
    
    // Minification'ı etkinleştir
    minify: true,
    
    // Node.js 18 target
    target: "node18",
    
    // Platform ayarı
    platform: "node"
  }
};
