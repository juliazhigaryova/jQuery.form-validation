(function ($) {
    //Значения по умолчанию
    var defaults = {
        classErrorMessage: 'fv-error', //Класс, для выделения сообщения об ошибке, если поле заполнено неверно
        classSuccessMessage: 'fv-success', //Класс, для выделения сообщения о правильно заполненном поле
        successFieldDisabled: true, //Добавлять ли к input атрибут readonly
        classDisabled: 'fv-disabled', //Класс, добавляемый к полю вместе с атрибутом readonly
        classBgError: 'fv-bg-error' //Класс, добавляемый к самому полю для ввода при ошибке

    };

    //Всегда актуальные настройки
    var options;

    $.fn.formValidation = function (params) {
        //Для того, чтобы при многократном вызове настройки сохранялись
        options = $.extend({}, defaults, options, params);

        //Методы для валидации
        /**
         * Валидатор для строк.
         *
         * @param item Поле для ввода
         * @returns {boolean} Правильно ли заполнено поле
         */
        function validatorString(item) {
            var isOk = true;
            var value = $(item).val();

            var dataMin = $(item).attr('data-fv-min');
            var dataMax = $(item).attr('data-fv-max');
            var dataRequired = $(item).attr('data-fv-required');
            var dataPattern = $(item).attr('data-fv-pattern');

            //Если заполнение поля обязательно
            if (dataRequired && value.length === 0) {
                isOk = false;
            }

            //Если задана минимальная длина строки
            if (!(dataMin && value.length >= dataMin) && value.length) {
                isOk = false;
            }

            //Если задана максимальная длина строки
            if (!(dataMax && value.length <= dataMax) && value.length) {
                isOk = false;
            }

            //Проверка на регулярные выражения
            if (dataPattern) {
                var regExp = new RegExp(dataPattern, 'i');
                if (!regExp.test(value)) {
                    isOk = false;
                }
            }

            return isOk;
        }

        /**
         * Валидатор чисел.
         *
         * @param item Поле для ввода
         * @returns {boolean} Правильно ли заполнено поле
         */
        function validatorNumber(item) {
            var isOk = true;
            var value = $(item).val();

            var dataRequired = $(item).attr('data-fv-required');
            var dataMinValue = parseInt($(item).attr('data-fv-min'));
            var dataMaxValue = parseInt($(item).attr('data-fv-max'));

            //Если заполнение поля обязательно
            if (dataRequired && value.length === 0) {
                isOk = false;
            }

            //Если задано минимальное значение числа
            if (!(dataMinValue !== undefined && value >= dataMinValue) && value.length) {
                isOk = false;
            }

            //Если задано максимальное значение числа
            if (!(dataMaxValue !== undefined && value <= dataMaxValue) && value.length) {
                isOk = false;
            }

            return isOk;
        }

        /**
         * Валидатор E-mail.
         *
         * @param item Поле для ввода
         * @returns {boolean} Правильно ли заполнено поле
         */
        function validatorEmail(item) {
            var isOk = true;
            var value = $(item).val();

            var dataRequired = $(item).attr('data-fv-required');

            //Если заполнение поля обязательно
            if (dataRequired && value.length === 0) {
                isOk = false;
            }

            //Проверка на регулярные выражения
            if (value.length > 0) {
                var regExp = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/i;
                if (!regExp.test(value)) {
                    isOk = false;
                }
            }
            return isOk;
        }

        /**
         * Валидатор по регулярному выражению.
         *
         * @param item Поле для ввода
         * @returns {boolean} Правильно ли заполнено поле
         */
        function validatorPattern(item) {
            var isOk = true;
            var value = $(item).val();

            var dataRequired = $(item).attr('data-fv-required');
            var dataPattern = $(item).attr('data-fv-pattern');

            //Если заполнение поля обязательно
            if (dataRequired && value.length === 0) {
                isOk = false;
            }

            //Проверка на регулярные выражения
            if (dataPattern && value.length > 0) {
                var regExp = new RegExp(dataPattern, 'i');
                if (!regExp.test(value)) {
                    isOk = false;
                }
            }
            return isOk;
        }

        //Метод для вывода результата валидации
        function resultValidator(item, isOk, successMessage, errorMessage) {
            var $item = $(item);
            var $nexItem = $item.next();
            //Удаляем контейнер с предыдущем сообщением
            if ($nexItem.hasClass(options.classErrorMessage) || $nexItem.hasClass(options.classSuccessMessage)) {
                $nexItem.remove();
            }
            //Создаем новый контейнер
            var $resultContainer = $('<div/>', {
                class: (isOk) ? options.classSuccessMessage : options.classErrorMessage,
                text: (isOk) ? successMessage : errorMessage
            });
            $resultContainer.insertAfter($item);

            if (options.successFieldDisabled && isOk) {
                $item.attr('readonly', 'readonly')
                    .addClass(options.classDisabled)
                    .removeClass(options.classBgError);
            }

            //Если поле заполнено неверно
            if (!isOk) {
                $item.addClass(options.classBgError);
            }
        }

        //Перебираем все элементы коллекции (формы) и возвращаем их
        // для сохранения цепочек вызовов в jQuery
        return this.each(function (index, item) {
            //Убираем атрибут disabled, если поле заблокировано
            $(item).on('click', 'input', function () {
                var $el = $(this);
                if ($el.attr('readonly')) {
                    $el.attr('readonly', null).removeClass(options.classDisabled);
                }
                //Удаляем класс, добавляемый при ошибке
                $el.removeClass(options.classBgError);
            });

            //Навешиваем функцию обработчик на попытку отправки всех форм коллекции
            $(item).on('submit', function (event) {
                var isOk = false; //Правильно ли заполнено поле

                //Выбираем те поля формы, которые имеют атрибут data-fv-validator
                var fields = $(this).find('*[data-fv-validator]');
                //Флаг, можно ли отправлять форму
                var isFormValid = true;

                fields.each(function (index, item) {
                    var dataValidator = $(item).attr('data-fv-validator');
                    var dataSuccess = $(item).attr('data-fv-success') || 'Поле заполнено верно';
                    var dataError = $(item).attr('data-fv-error') || 'Поле заполнено неверно';

                    //Проверки
                    switch (dataValidator) {
                        case 'string':
                            isOk = validatorString(item);
                            resultValidator(item, isOk, dataSuccess, dataError);
                            break;
                        case 'number':
                            isOk = validatorNumber(item);
                            resultValidator(item, isOk, dataSuccess, dataError);
                            break;
                        case 'regexp':
                            isOk = validatorPattern(item);
                            resultValidator(item, isOk, dataSuccess, dataError);
                            break;
                        case 'email':
                            isOk = validatorEmail(item);
                            resultValidator(item, isOk, dataSuccess, dataError);
                            break;
                        default:
                            console.log('Валидатора', dataValidator,
                                'не существует. Имя поле:', $(item).attr('name'));
                            isOk = false;
                    }

                    //Если поле заполено неверно
                    if(!isOk){
                        isFormValid = false;
                    }
                });

                if (!isFormValid) {
                    event.preventDefault(); //Отмена действий браузера по умолчанию
                }
            });
        });
    }
})(jQuery);