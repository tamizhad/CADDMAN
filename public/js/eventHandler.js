$(document).ready(function () {


    $('#login-btn').on('click', function () {

        // var type = "danger";   //info, success, warning, danger
        // var title = "Error";
        // var message = "msg<br/>Content";
        // showMessage(type, title, message);

        var params = {
            "username": $("#username").val(),
            "password": $("#password").val()
        }

        $.ajax({
            type: "POST",
            url: "/authenticate",
            data: params,
            success: function (data) {
                if(data && data.code == 200){
                    location.href = '/home';
                }else if(data && data.code == 400){
                    $('.error').removeClass('hide');
                }else{
                    var type = "danger";   //info, success, warning, danger
                    var title = "Login error";
                    var message = "Internal problem";
                    showMessage(type, title, message);
                }
            },
            error: function (data) {
                var type = "danger";   //info, success, warning, danger
                var title = "Login error";
                var message = "Internal problem";
                showMessage(type, title, message);
            },
        });


    });

    $(document).on({
        mouseenter: function (ele) {
            $(ele.target).closest('.left-panel-component').addClass('hover');
        },
        mouseleave: function (ele) {
            $(ele.target).closest('.left-panel-component').removeClass('hover');
        }
    }, ".left-panel-arrow, .left-panel-icon, .left-panel-component-name");    


    $(document).on('click', ".left-panel-arrow, .left-panel-icon, .left-panel-component-name", function(ele) {
        $('.left-panel-component').removeClass('active');
        var parent = $(ele.target).closest('.left-panel-component');
        parent.addClass('active');        

        var forId = $(parent).attr('for-id');

        var params = {
            'dataType' : forId
        }

        $.ajax({
            type: "POST",
            url: "/get-data",
            data: params,
            success: function (data) {
                if(data && data.code == 200){
                    $('.main-panel').addClass('hide').removeClass('active');
                    var newData = $(data.html).find('#'+forId).html();
                    $('#'+forId).removeClass('hide').addClass('active').html(newData);
                }else{
                    console.log();
                }                
            },
            error: function (data) {
                var type = "danger";   //info, success, warning, danger
                var title = "Error";
                var message = "Unable to get "+forId+" data";
                showMessage(type, title, message);
                setTimeout(function(){
                    dismissMessage();
                }, 5000);
            },
        });
    });

    //To hide/show filter row
    $(document).on('click', ".filter", function(ele) {
        var mainPanel = $(ele.target).closest('.main-panel');
        var mainPanelId = mainPanel.attr('id');
        $(mainPanel).find('table tr#search').toggle();
    });
    
    //To show rows based on filter value
    $(document).on('keyup', ".table tr#search input", function(ele) {
        var rows = $(ele.target).closest('table').find('tbody tr:not(#search)');
        var eleClass = $(ele.target).closest('td').attr('class');
        var val = $(ele.target).val().replace(/\s+/g, ' ').toLowerCase();
    
        rows.each(function(){
            var inputText = $(this).find('td.'+eleClass).text().replace(/\s+/g, ' ').toLowerCase();
            if(inputText.includes(val)){
                $(this).removeClass('hide-'+eleClass);
            }else{
                $(this).addClass('hide-'+eleClass);
            }
        });
    });

    //To clear filter
    $(document).on('click', ".clear-btn", function(ele) {
        var mainPanel = $(ele.target).closest('.main-panel');
        $(mainPanel).find('table tr#search input').val('');
        
        $(mainPanel).find('table tr[class*="hide-"]').removeClass(function (index, classNames) {
            var current_classes = classNames.split(" ")
            var classes_to_remove = [];
            $.each(current_classes, function (index, class_name) {
              if (/^(hide\-.*)/.test(class_name)) {
                classes_to_remove.push(class_name);
              }
            });
            return classes_to_remove.join(" ");
          });
    });

    $(document).on('click', "#save-btn", function(ele) {
        var curModalId = $(ele.target).closest('.modal').attr('id');
        var parentEle = $(ele.target).closest('.modal-dialog');
        var saveType = $(ele.target).closest('.modal').attr('data-save-type');
        var dataType = $(parentEle).attr("query-type");

        $('#saving-btn').removeClass('hide');
        $('#save-btn').addClass('hide');
        var params = {
            "curRowId": $(ele.target).closest('.modal').attr('data-id'),            
            "queryType": saveType+"-"+dataType,
            "dataType": dataType,
            "clientName": $(parentEle).find("#client-name").val(),
            "clientContactPerson": $(parentEle).find("#client-contact-person").val(),
            "role": $(parentEle).find("#role").text(),
            "clientContactNo": $(parentEle).find("#contact-no").val(),
            "email": $(parentEle).find("#email").val(),
            "clientWebsite": $(parentEle).find("#client-website").val(),
            "clientAddress": $(parentEle).find("#client-address").val(),
            "clientState": $(parentEle).find("#client-state").val(),
            "clientLeadStatus": $(parentEle).find("#client-lead-status").text(),
            "dueDate": $(parentEle).find("#due-date").val(),
            "clientSales": $(parentEle).find("#client-sales").text(),

            "firstName": $(parentEle).find("#first-name").val(),
            "lastName": $(parentEle).find("#last-name").val(),
            "username": $(parentEle).find("#username").val(),
            "password": $(parentEle).find("#password").val(),      
            "status": "active"      
        }

        $.ajax({
            type: "POST",
            url: "/update-db",
            data: params,
            success: function (data) {
                $('#saving-btn').addClass('hide');
                $('#save-btn').removeClass('hide');

                if(data && data.code == 200){
                    $('#'+curModalId+" button.close").trigger('click');

                    if(data.new_row){
                        var curId = $(data.new_row).attr('id');
                        if(saveType == 'add'){
                            var rowCnt = $('.main-panel.active#'+dataType+' .table tbody tr:not(.hide):not(#search):not(.fade)').length;
                            $('.main-panel.active#'+dataType+' .table tbody').append(data.new_row);
                            $('.main-panel.active#'+dataType+' #'+curId).find('.data-sno').text((rowCnt+1));
                        }else if(saveType == 'update') {
                            $('.main-panel.active#'+dataType+' #'+curId).html($(data.new_row).html());
                            $('.main-panel.active#'+dataType+' #'+curId).attr('class', $(data.new_row).attr('class'));
                        }
                    }          
                    $(function () {
                        $('[data-id="picker-due-date"]').datetimepicker({
                            format: 'DD-MM-YYYY'
                        });
                    });
                    var type = "success";   //info, success, warning, danger
                    var title = "Success";
                    var message = (saveType == 'update')? dataType+" updated!" : dataType+" added!";
                    showMessage(type, title, message);
                    setTimeout(function(){
                        dismissMessage();
                    }, 5000);
                }else if(data && data.code == 400 && /(duplicate username)/.test(data.message)){
                    var type = "danger";   //info, success, warning, danger
                    var title = "Error";
                    var message = "Username already exist!";
                    showMessage(type, title, message);
                    setTimeout(function(){
                        dismissMessage();
                    }, 5000);
                }else{
                    var type = "danger";   //info, success, warning, danger
                    var title = "Error";
                    var message = "Can't "+saveType+" "+dataType+"!";
                    showMessage(type, title, message);
                    setTimeout(function(){
                        dismissMessage();
                    }, 5000);
                }
            },
            error: function (data) {
                $('#saving-btn').addClass('hide');
                $('#save-btn').removeClass('hide');
                var type = "danger";   //info, success, warning, danger
                var title = "Error";
                var message = "Can't "+saveType+" "+dataType+"!";
                showMessage(type, title, message);
                setTimeout(function(){
                    dismissMessage();
                }, 5000);
            },
        });        

    });

    //To delete current row
    $(document).on('click', ".delete", function(ele) {        
        var params = {
            "curRowId" : $(ele.target).closest('tr').attr('id'),
            "dataType" : $(ele.target).closest('.main-panel').attr('id'),
            "queryType": $(ele.target).attr("query-type"),
        }

        $.ajax({
            type: "POST",
            url: "/update-db",
            data: params,
            success: function (data) {
                if(data && data.code == 200){
                    var table = $(ele.target).closest('table');
                    
                    $(ele.target).closest('tr').remove();
                    
                    var snoRows = $(table).find('tbody tr:not(.hide):not(#search):not(.fade) td.data-sno');
                    snoRows.each(function(i, e){
                        $(this).text(i+1);
                    })

                    var type = "success";   //info, success, warning, danger
                    var title = "Success";
                    var message = "Deleted!";
                    showMessage(type, title, message);
                    setTimeout(function(){
                        dismissMessage();
                    }, 5000);
                }else if(data && data.code == 400){
                    var type = "danger";   //info, success, warning, danger
                    var title = "Error";
                    var message = "Can't delete. System error!";
                    showMessage(type, title, message);
                    setTimeout(function(){
                        dismissMessage();
                    }, 5000);
                }                
            },
            error: function (data) {
                var type = "danger";   //info, success, warning, danger
                var title = "Error";
                var message = "Can't delete. System error!";
                showMessage(type, title, message);
                setTimeout(function(){
                    dismissMessage();
                }, 5000);
            },
        });  

    });

    //logout
    $(document).on('click', ".logout-btn", function(ele) {
        $.ajax({
            type: "POST",
            url: "/logout",
            success: function (data) {
                window.location.href = '/login';
            },
            error: function(err){
                var type = "danger";   //info, success, warning, danger
                var title = "Error";
                var message = "Can't logout. System error!";
                showMessage(type, title, message);
            }
        }); 
    });

    $(document).on('input', "[data-id='picker-due-date']", function(ele) {
        alert('changed');
    });

    $(document).on('click', ".data-password .glyphicon-eye-close", function(ele) {
        var targetEle = $(ele.target).closest('td').find('[data-value]');
        $(targetEle).text($(targetEle).attr('data-value'));
        $(ele.target).removeClass('glyphicon-eye-close');
        $(ele.target).addClass('glyphicon-eye-open');
    });

    $(document).on('click', ".data-password .glyphicon-eye-open", function(ele) {
        var targetEle = $(ele.target).closest('td').find('[data-value]');
        $(targetEle).text('********');
        $(ele.target).removeClass('glyphicon-eye-open');
        $(ele.target).addClass('glyphicon-eye-close');
    });

    $(document).on('click', "[data-toggle='modal']", function(ele) {
        //To hide saving button
        $('#saving-btn').addClass('hide');
        $('#save-btn').removeClass('hide');

        var relatedTarget = ele.target;
        var targetEle = $('.modal'+$(relatedTarget).attr('data-target'));

        $(targetEle).removeAttr('data-id');
        $(targetEle).removeAttr('data-save-type');

        $(targetEle).attr('data-id', $(relatedTarget).closest('tr').attr('id'));
        
        if($(relatedTarget).hasClass('edit')){
            $(targetEle).attr('data-save-type', 'update');
        }else{
            $(targetEle).attr('data-save-type', 'add');
        }

        var curClient = $(relatedTarget).closest('tr[id]');
        $(targetEle).find('input, .dropdown .dropdown-toggle').each(function(i, ele){
            var id = $(ele).attr('id');            
            if($(ele).attr('id') == 'due-date'){
                var value = $(curClient).find('.data-'+id+' input').val();
            }else{
                var value = $(curClient).find('.data-'+id).text();
            }
            if(/(input)/i.test(ele.tagName)){
                if($(ele).attr('id') == 'password'){
                    $(ele).val($(curClient).find('.data-'+id+' span[data-value]').attr('data-value'));
                }else{
                    $(ele).val(value);
                }                
            }else if(value){
                $(ele).text(value);
            }
        });
    });

    $('.modal').on('show.bs.modal', function (ele) {

    })

    $('.modal').on('hidden.bs.modal', function (ele) {
        
    })

    $('.modal').on('hide.bs.modal', function (ele) {
        // $(ele.target).removeAttr('data-id');
        // $(ele.target).removeAttr('data-save-type');
    })

    $('.modal').on('shown.bs.modal', function (ele) {
        console.log('shown.bs.modal');
    })

    $('.dropdown-menu a').on('click', function(){
        $(this).closest('.dropdown').find('.dropdown-toggle').html($(this).html());
    })

    function dismissMessage() {
        const notification = document.querySelector('.notification');
        notification.classList.remove('received');
        $('.notification').addClass('hide');
    }

    function showMessage(type, title, messageContent) {
        $('.notification').removeClass('hide');
        if($('.notification.received').length>0){
            dismissMessage();
            showMessage(type, title, messageContent);
            // setTimeout(function(){
            //     showMessage(type, title, messageContent)
            // }, 0)
        }else{
            const notification = document.querySelector('.notification');
            // notification.classList.remove('hide');
            const message = document.querySelector('.notification__message');
            $('.notification__message h1').html(title);
            $('.notification__message p').html(messageContent);
    
            message.className = `notification__message message--` + type;            
            notification.classList.add('received');            
            const button = document.querySelector('.notification__message button');
            button.addEventListener('click', dismissMessage, {
                once: true
            });
        }
    }

    function toggleClass(ele, className){
        if($(ele).hasClass(className)){
            $(ele).removeClass(className);
        }else{
            $(ele).addClass(className);
        }
    }

    // $(function () {
    //     $('#datetimepicker1').datetimepicker();
    // });

});