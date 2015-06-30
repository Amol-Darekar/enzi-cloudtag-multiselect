var cloudApp = angular.module('enziCloudTag', []);
cloudApp.directive('enziCloudMultiselect', function () {
    return {
        scope: {
            editable: '=editable',
            list: '=list',
            watermark:'=watermark',
            validation: '=validation',
            csvlist: '=csvlist',
            delimiter: '=delimiter'
        },
        restrict: 'AE',
        link: function ($scope, element, attrs){
            setTimeout(function () {
                $scope.onLoad();
            }, 500);
        },
        template: '<input type="text" style="display:none;" ng-model="test" required/><div class="cloud-container cloud-container-multi cloud-with-drop cloud-container-active">' +
                            '<ul id="{{containerid}}" class="cloud-choices" data-toggle="cloud-tooltip" data-original-title="Skills are required" >' +
                                '<div id="{{cloudContainerDiv}}"></div><li class="element-search-field" ng-class="{\'cloud-active-result\': false}"><input type="text" name="cloudtxt" id="{{cloudtext}}" placeholder="{{watermark}}" class="element-search-field" style="width:auto;" ng-click="showDropDown()" ng-model="searchText" ng-class="{\'ng-invalid\': true}" ng-focus="showDropDown()" /></li>' +
                            '</ul>' +
                            '<div id="{{elementid}}" class="cloud-drop ddl-options drop-results" style="width:100%;">' +
                                '<ul id="uldroplist" class="cloud-search-results">' +
                                    '<li class="hover-support-class" tabindex="{{item.index}}" ng-click="getListText(item,$event);" ng-repeat="item in list|filter:searchText" ng-class="{\'cloud-active-result\': selectedList.indexOf(item)<0,\'selected-result\': selectedList.indexOf(item)>=0}">{{item.name}}</li>' +
                                '</ul>' +
                                '<span ng-show="(list | filter:searchText).length == 0" style="color:gray;">No results found for "{{searchText}}" <span ng-show="editable==true">press Enter to add new</span></span>' +
                            '</div>' +
                    '</div>',
        controller: ['$scope', '$element', '$compile', function ($scope, $element, $compile) {
            $scope.searchText;
            $scope.test = 'validTest';
            $scope.selectedList = [];
            $scope.placeholder=$scope.watermark;
            $scope.showDropResult=false;
            var ele, flag = true;

            //Function to generate dynamic ID's
            $scope.generateElementId = function () {
                var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
                var string_length = 8;
                var randomstring = '';
                for (var i = 0; i < string_length; i++) {
                    var rnum = Math.floor(Math.random() * chars.length);
                    randomstring += chars.substring(rnum, rnum + 1);
                }
                return randomstring;
            }

            $scope.elementid = "droplist" + $scope.generateElementId();
            $scope.containerid = $scope.generateElementId();
            $scope.cloudtext = "cloudtext" + $scope.generateElementId();
            $scope.cloudContainerDiv="cloudContainer"+$scope.generateElementId();
            var optionList = [];

            //Function to create cloud of optionList which are alreay selected.
            $scope.onLoad = function () {
            	if ($scope.csvlist != "" && $scope.csvlist != undefined) {
                    var optionList;
                    if ($scope.csvlist.constructor === Array)
                    	optionList = $scope.csvlist.slice();
                    else
                    	optionList = $scope.csvlist.split($scope.delimiter);

                    var availableOptions = [];
                    angular.forEach($scope.list, function (value, key) {
                        if (optionList.indexOf(value.name) != -1) {
                            ele = '<li class="search-option"><span class="">' + value.name + '</span><a class="search-option-close anchor-element" data-option-array-index="' + value.index + '" ng-click="deleteCloud($event)"></a></li>';
                            ele = $compile(ele)($scope);
                            angular.element($('#' + $scope.cloudContainerDiv)).append(ele);
                            $scope.selectedList.push(value);
                            availableOptions.push(value.name);
                            $scope.bindText();
                        }
                    });

                    angular.forEach(optionList, function (value) {
                        if (availableOptions.indexOf(value) == -1) {
                            $scope.list.push({ 'index': ($scope.list.length + 1).toString(), 'name': value });
                            $scope.selectedList.push($scope.list[$scope.list.length - 1]);
                            ele = '<li class="search-option"><span class="">' + value + '</span><a class="search-option-close anchor-element" data-option-array-index="' + $scope.list.length + '" ng-click="deleteCloud($event)"></a></li>';
                            ele = $compile(ele)($scope);
                            angular.element($('#' + $scope.cloudContainerDiv)).append(ele);
                            $scope.bindText();
                        }
                    });

                    $scope.record = [];
                    angular.forEach(optionList, function (value) {
                        $scope.record.push({ 'name': value });
                    });

                    if ($scope.selectedList.length == 0 && $scope.validation==true){
                        $('#' + $scope.containerid).parent().addClass('cloud-required');
                    }

                } else {
                    $scope.record = [];
                }
            }

            $scope.showDropDown = function (){
                 $('#' + $scope.elementid).removeClass("drop-results").addClass("dropdown-results");
            }

            //Function get called when we select any optionList from available list from dropdown
            $scope.getListText = function (item, $event) {
                if (!$($event.target).hasClass("selected-result")){
                    ele = '<li class="search-option"><span class="">' + item.name + '</span><a class="search-option-close anchor-element" data-option-array-index="' + item.index + '" ng-click="deleteCloud($event)"></a></li>';
                    $scope.record.push({ 'name': item.name });
                	$scope.selectedList.push(item);
                    $scope.bindText();
                    setTimeout(function () {
                        ele = $compile(ele)($scope);
                        angular.element($('#'+ $scope.cloudContainerDiv)).append(ele);
                        $($event.target).removeClass("cloud-active-result").addClass("selected-result");
                        if ($scope.selectedList.length > 0 && $scope.validation==true){
                            $('#' + $scope.containerid).removeClass('cloud-required');
                        }
                        if ($scope.selectedList.length > 0) {
                            $scope.test = 'validTest';
                        }
                        ele = '';
                        $('#' + $scope.elementid).removeClass("dropdown-results").addClass("drop-results");
                        $(".cloud-active-result").addClass("hover-support-class");
                        $(".selected-result").removeClass("eleHover");
                        $scope.searchText = '';
                        $("#" + $scope.cloudtext).focus();
                        $scope.bindText();
                    }, 100);

                }
            }

            //Function called when we click on close Icon of cloud tag
            $scope.deleteCloud = function ($event){
                var name, optionIndex, index = $($event.currentTarget).attr('data-option-array-index');
                var ddl_div = $('ul').find('li');
                $(ddl_div[index - 1]).removeClass('selected-result').addClass('cloud-active-result');
                $(".element-search-field").removeClass('cloud-active-result');

                setTimeout(function () {
                    $($event.target).parent().remove();
                    $("#" + $scope.cloudtext).focus();
                    $('#' + $scope.elementid).removeClass("dropdown-results").addClass("drop-results");
                }, 100);


                for (var i = 0; i < $scope.selectedList.length; i++) {
                    if ($scope.selectedList[i].index == index) {
                        index = i;
                        name = $scope.selectedList[i].name;
                        break;
                    }
                }

                angular.forEach($scope.record, function (value, key) {
                    if ($scope.record[key].name == name) {
                        optionIndex = key;
                    }
                });
                $scope.record.splice(optionIndex, 1);
                $scope.selectedList.splice(index, 1);
                $scope.bindText();
                if ($scope.selectedList.length == 0 && $scope.validation==true) {
                    $('#' + $scope.containerid).addClass('cloud-required');
                    $scope.test = '';
                }
            }

            $(document).mouseup(function (event){
            	$('#' + $scope.elementid).removeClass("dropdown-results").addClass("drop-results");

            })

            $element.bind('keydown', function (event) {
            $('#' + $scope.elementid).removeClass("drop-results").addClass("dropdown-results");
                if (event.keyCode == 40) {
                    var dropDownDiv = document.getElementById($scope.elementid);
                    if (dropDownDiv != null && dropDownDiv.tagName == 'LI') {
                        dropDownDiv = $(dropDownDiv).closest('div.ddl-options');
                    } else if (!dropDownDiv) {
                        dropDownDiv = $(event.target).closest('div.ddl-options');
                    }
                    if (dropDownDiv) {
                        var options = $(dropDownDiv).find('li.cloud-active-result');
                        var selectedOption = $(dropDownDiv).find('li.eleHover');
                        if (options) {
                            $($(dropDownDiv).find('li')).removeClass('eleHover');
                            if (selectedOption.length > 0) {
                                var optionIndex = parseInt($(selectedOption).attr('tabindex'));
                                var nextOption = $(dropDownDiv).find("li.cloud-active-result[tabindex='" + (optionIndex + 1) + "']");
                                if (!nextOption || nextOption.length == 0){
                                    while (($scope.list.length - 1) >= optionIndex && nextOption.length == 0) {
                                        optionIndex++;
                                        nextOption = $(dropDownDiv).find("li.cloud-active-result[tabindex='" + (optionIndex + 1) + "']");
                                    }
                                }
                                if (nextOption.length > 0) {
                                    $(nextOption[0]).addClass('eleHover');
                                    $(nextOption[0]).focus();
                                } else {
                                    $(options[0]).addClass('eleHover');
                                    $(options[0]).focus();
                                }
                            }
                            else {
                                $(options[0]).addClass('eleHover');
                                $(options[0]).focus();
                            }
                        }
                    }
                    event.stopPropagation();
                    event.preventDefault();
                }

                if (event.keyCode == 38) {
                    var dropDownDiv = document.getElementById($scope.elementid);
                    if (dropDownDiv != null && dropDownDiv.tagName == 'LI') {
                        dropDownDiv = $(dropDownDiv).closest('div.ddl-options');
                    } else if (!dropDownDiv) {
                        dropDownDiv = $(event.target).closest('div.ddl-options');
                    }
                    if (dropDownDiv) {
                        var options = $(dropDownDiv).find('li.cloud-active-result');
                        //var options = 1;
                        var selectedOption = $(dropDownDiv).find('li.eleHover');
                        if (options) {
                            $($(dropDownDiv).find('li')).removeClass('eleHover');
                            if (selectedOption.length > 0) {
                                var optionIndex = parseInt($(selectedOption).attr('tabindex'));
                                var nextOption = $(dropDownDiv).find("li.cloud-active-result[tabindex='" + (optionIndex - 1) + "']");
                                
                                if (!nextOption || nextOption.length == 0) {
                                	console.log('While out==>' + $scope.list.length);
                                	while (1 <= optionIndex && nextOption.length == 0) { //  while (options <= optionIndex && nextOption.length == 0)
                                		console.log('While In==>' + $scope.list.length);
                                	    optionIndex--;

                                        nextOption = $(dropDownDiv).find("li.cloud-active-result[tabindex='" + (optionIndex - 1) + "']");
                                    }
                                }
                                if (nextOption.length > 0){
                                    $(nextOption[0]).addClass('eleHover');
                                    $(nextOption[0]).focus();
                                } else {
                                	$(options[options.length - 1]).addClass('eleHover');
                                	$(options[options.length - 1]).focus();
                                }
                            }
                            else {
                            	$(options[0]).addClass('eleHover');
                            	$(options[0]).focus();
                            }
                        }
                    }
                    event.stopPropagation();
                }

                if (event.keyCode == 13) {
                    if ($scope.editable && event.target.id == $scope.cloudtext) {
                        var newElementFlag = true;
                        var nextOption;
                        
                        if (!(/\S/.test($scope.searchText))) {
                        	return;
                        }

                        $scope.searchText= $("#" + $scope.cloudtext).val().trim();

                        for (var i = 0; i < $scope.list.length; i++) {
                        	if ($("#" + $scope.cloudtext).val() == '' || $scope.list[i].name.toUpperCase() == $scope.searchText.toUpperCase()) {
                                index = i;
                                newElementFlag = false;
                                break;
                            }
                        }

                        if (newElementFlag) {
                        	$scope.list.push({ index: ($scope.list.length + 1).toString(), name: $scope.searchText });
                            var ele = '<li class="search-option"><span class="">' + $scope.list[$scope.list.length - 1].name + '</span><a class="search-option-close anchor-element" data-option-array-index="' + $scope.list[$scope.list.length - 1].index + '" ng-click="deleteCloud($event)"></a></li>';
                            ele = $compile(ele)($scope);
                            angular.element($('#'+$scope.cloudContainerDiv)).append(ele);
                            $scope.selectedList.push($scope.list[$scope.list.length - 1]);
                            $scope.record.push({ 'name': $scope.searchText });
                            $("#" + $scope.cloudtext).focus();
                            $scope.searchText = '';

                            if ($scope.selectedList.length > 0 && $scope.validation == true) {
                                $scope.test = 'validTest';
                            }
                            $scope.bindText();
                            simulate(document.getElementById($scope.cloudtext), "click");

                        }
                    } else {
                        angular.element('.eleHover').trigger('click');
                        $scope.searchText = '';
                    }
                }

                if (event.keyCode == 9){
                    $scope.searchText = '';
                    angular.element('.eleHover').trigger('click');
                     $('#' + $scope.elementid).removeClass("dropdown-results").addClass("drop-results");

                }

                if (event.keyCode == 8) {
                	if ($("#" + $scope.cloudtext).val() == '' && $scope.selectedList.length>0) {
                		var cloudAnchor = $('#' + $scope.cloudContainerDiv + ' a');  //angular.element$('#'+$scope.cloudContainerDiv+' a')
                		simulate(cloudAnchor[cloudAnchor.length - 1], "click");
                	}
                			
                }

            });

            $scope.bindText = function () {
            	$scope.csvlist='';
            	for (var i = 0; i < $scope.selectedList.length; i++) {
            		if ($scope.csvlist == '') {
            			$scope.csvlist = $scope.selectedList[i].name;
            		}
            		else {
            			$scope.csvlist += $scope.delimiter + $scope.selectedList[i].name;
            		}
            	}
            }

            $element.bind('click', function (event) {
                $('#' + $scope.elementid).removeClass("drop-results").addClass("dropdown-results");
                if (event.target.id == $scope.containerid) {
                    $("#" + $scope.cloudtext).focus();
                }
            });

            //Function for simulate events manually here It is use to fire click event manually when user clicks hit enter key to add new skill which is not present in a Available list of optionList .
            function simulate(element, eventName) {
                var options = extend(defaultOptions, arguments[2] || {});
                var oEvent, eventType = null;

                for (var name in eventMatchers) {
                    if (eventMatchers[name].test(eventName)) { eventType = name; break; }
                }

                if (!eventType)
                    throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

                if (document.createEvent) {
                    oEvent = document.createEvent(eventType);
                    if (eventType == 'HTMLEvents') {
                        oEvent.initEvent(eventName, options.bubbles, options.cancelable);
                    }
                    else {
                        oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                        options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                        options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
                    }
                    element.dispatchEvent(oEvent);
                }
                else {
                    options.clientX = options.pointerX;
                    options.clientY = options.pointerY;
                    var evt = document.createEventObject();
                    oEvent = extend(evt, options);
                    element.fireEvent('on' + eventName, oEvent);
                }
                return element;
            }

            function extend(destination, source) {
                for (var property in source)
                    destination[property] = source[property];
                return destination;
            }

            var eventMatchers = {
                'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
                'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
            }
            var defaultOptions = {
                pointerX: 0,
                pointerY: 0,
                button: 0,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                bubbles: true,
                cancelable: true
            }

        }]
    };
});



