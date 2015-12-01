angular.module('lukkari.services')
  .factory('Lessons', ['$http', 'ApiEndpoint', 'MyDate',
    function($http, ApiEndpoint, MyDate) {
      var lessons = [];
      var savedGroupName = '';

      function parseLesson(element, index, array) {
        var lesson = {};
        lesson.id = index;
        lesson.startDay = new Date(element.startDate);
        lesson.endDay = new Date(element.endDate);
        lesson.groups = [];
        // parse the resources array
        var {
          resources
        } = element;
        resources.forEach(function(resource, index, array) {
          switch (resource.type) {
            case 'realization':
              lesson.code = resource.code;
              lesson.name = resource.name;
              break;
            case 'room':
              lesson.room = resource.code;
              lesson.roomInfo = resource.parent.name;
              break;
            case 'student_group':
              lesson.groups.push(resource.code);
              break;
          }
        });
        lessons.push(lesson);
      }

      function get(callback) {
        var data = {
          studentGroup: [savedGroupName]
        };
        var apiKey = 'Wu47zzKEPa7agvin47f5';
        var url = ApiEndpoint.url + '/reservation/search' +
          '?apiKey=' + apiKey;
        $http({
          method: 'POST',
          url: url,
          data: data,
          withCredentials: true,
          headers: {
            'authorization': 'Basic V3U0N3p6S0VQYTdhZ3ZpbjQ3ZjU6',
            'accept-language': 'fi',
            'content-type': 'application/json',
            'cache-control': 'no-cache'
          }
        }).success(function(data, status, headers, config) {
          console.log('success');
          lessons = [];
          data.reservations.forEach(parseLesson);
          callback({
            success: false
          });
        }).error(function(data, status, headers, config) {
          console.log('failure');
          callback({
            success: false
          });
        });
      }

      // private get method that just saves lessons
      // change group name method that changes group anme and uses private get method
      function changeGroup({
        groupName, callback
      }) {
        savedGroupName = groupName.toUpperCase();
        get(function(result) {
          callback(result);
        });
      }

      // get day method that returns one day's lessons using date
      function getDay({
        callback, day
      }) {
        if (!day || !day instanceof Date) {
          console.error('Error in date!');
          callback({
            success: false
          });
        } else {
          var dayLessons = [];
          lessons.forEach(function(lesson, index, array) {
            var date = lesson.startDay;
            if (date.getDate() === day.getDate() &&
              date.getMonth() === day.getMonth()) {
              dayLessons.push(lesson);
            }
          });
          callback({
            success: true,
            dayLessons
          });
        }
      }

      // get week method that returns one week's lessons using startDate and week offset
      function getWeek({
        callback, day
      }) {
        var weekLessons = [];
        var startDate = new Date(day.getFullYear(), day.getMonth(),
          day.getDate());
        var endDate = MyDate.getDayFromDay({
          currentDay: day,
          offsetDays: 5
        });
        lessons.forEach(function(lesson, index, array) {
          if (lesson.startDay >= startDate && lesson.startDay <= endDate) {
            weekLessons.push(lesson);
          }
        });
        callback({
          success: true,
          weekLessons
        });
      }

      //get day to day method that returns all appointments from day a to day b
      function getDayToDay({
        callback, startDate, endDate
      }) {
        var correctEndDate = MyDate.getDayFromDay({
          currentDay: endDate,
          offsetDays: 1
        });
        var retLessons = [];
        lessons.forEach(function(lesson, index, array) {
          if (lesson.startDay >= startDate && lesson.startDay <=
            correctEndDate) {
            retLessons.push(lesson);
          }
        });
        callback({
          success: true,
          lessons: retLessons
        });
      }

      function getLesson(id) {
        return lessons[id];
      }

      return {
        changeGroup: changeGroup,
        getDay: getDay,
        getWeek: getWeek,
        getDayToDay: getDayToDay,
        getLesson: getLesson
      };
    }
  ]);