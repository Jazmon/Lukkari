angular.module('lukkari.directives')
  .directive('date', [function() {
    return {
      template: ['{{day.date.toLocaleDateString(', navigator.language, ',',
        ' {weekday: "short", day: "numeric", month:"numeric"})}}'
      ].join('')
    };
  }]);
