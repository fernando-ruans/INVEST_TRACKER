# Investment Tracker - Android Setup Guide

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js** (versão 16 ou superior)
2. **Android Studio** (versão mais recente)
3. **Java Development Kit (JDK)** 11 ou superior
4. **Android SDK** (através do Android Studio)

## Configuração do Ambiente Android

### 1. Instalar Android Studio
- Baixe e instale o Android Studio do site oficial
- Durante a instalação, certifique-se de instalar:
  - Android SDK
  - Android SDK Platform-Tools
  - Android Virtual Device (AVD)

### 2. Configurar Variáveis de Ambiente
Adicione as seguintes variáveis ao seu sistema:

```bash
# Windows (adicionar ao PATH)
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
```

### 3. Instalar Dependências do Projeto

```bash
cd frontend
npm install
```

## Configuração do Capacitor

### 1. Inicializar o Capacitor (se necessário)
```bash
npm run cap:init
```

### 2. Adicionar Plataforma Android
```bash
npm run cap:add:android
```

### 3. Sincronizar o Projeto
```bash
npm run cap:sync
```

## Desenvolvimento

### Executar em Modo de Desenvolvimento
```bash
npm run android:dev
```

Este comando irá:
1. Fazer build do projeto React
2. Sincronizar com o Capacitor
3. Abrir o Android Studio

### Comandos Úteis

- **Build e Sync**: `npm run cap:sync`
- **Abrir Android Studio**: `npm run cap:open:android`
- **Executar no dispositivo**: `npm run cap:run:android`

## Configuração do Dispositivo/Emulador

### Emulador Android
1. Abra o Android Studio
2. Vá em Tools > AVD Manager
3. Crie um novo dispositivo virtual
4. Escolha uma API level 24 ou superior

### Dispositivo Físico
1. Ative as "Opções do desenvolvedor" no seu dispositivo
2. Ative a "Depuração USB"
3. Conecte o dispositivo via USB
4. Autorize a depuração quando solicitado

## Estrutura do Projeto Android

Após executar `npm run cap:add:android`, será criada a pasta:
```
frontend/
├── android/
│   ├── app/
│   ├── gradle/
│   └── ...
├── src/
├── public/
└── capacitor.config.ts
```

## Troubleshooting

### Erro: "Android SDK not found"
- Verifique se o ANDROID_HOME está configurado corretamente
- Reinstale o Android SDK através do Android Studio

### Erro: "Gradle build failed"
- Limpe o cache do Gradle: `cd android && ./gradlew clean`
- Verifique se o Java JDK está instalado corretamente

### Erro: "Device not found"
- Verifique se o emulador está rodando
- Para dispositivo físico, verifique se a depuração USB está ativada

## Recursos Adicionais

- [Documentação do Capacitor](https://capacitorjs.com/docs)
- [Guia Android do Capacitor](https://capacitorjs.com/docs/android)
- [Android Studio Documentation](https://developer.android.com/studio)

## Próximos Passos

1. Execute `npm install` na pasta frontend
2. Execute `npm run cap:add:android`
3. Execute `npm run android:dev`
4. O Android Studio será aberto automaticamente
5. Execute o app no emulador ou dispositivo físico