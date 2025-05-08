# update eas
npm install -g eas-cli

# login to eas
eas login

# configure build
eas build:configure

# build production apk
eas build -p android --profile productionApk

# build development apk
eas build -p android --profile developmentApk

# build development ios
eas build -p ios --profile developmentIos

# build production ios
eas build -p ios --profile productionIos

# add test devices for ios
eas device:create

# check build first locally
npx expo-doctor@latest

# check dependencies compatability
npx expo install --check

# register device for distribution build
eas device:create

# upgrade to latest version of expo
npx expo install expo@latest

# komitex android project id
# "extra": {
#   "eas": {
#     "projectId": "597979c3-801b-44a0-9bdc-50cd63c59ce9"
#   }
# }

npx expo prebuild

eas build --platform android --local
eas build --platform ios --local