module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@assets': './src/assets',
            '@features': './src/features',
            '@shared': './src/shared',
            '@navigation': './src/app/navigation',
          },
        },
      ],
    ],
  };
};
