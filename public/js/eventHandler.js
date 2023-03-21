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
                $("#resultarea").text(data);
            },
            error: function (data) {
                $("#resultarea").text(data);
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
        if($('#'+forId).length > 0){
            $('.main-panel').addClass('hide').removeClass('active');
            $('#'+forId).removeClass('hide').addClass('active');;
        }
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

        $('#saving-btn').removeClass('hide');
        $('#save-btn').addClass('hide');
        var params = {
            "queryType": $(parentEle).attr("query-type"),
            "clientName": $(parentEle).find("#client-name").val(),
            "clientContactPerson": $(parentEle).find("#client-contact-person").val(),
            "role": $(parentEle).find("#role").val(),
            "clientContactNo": $(parentEle).find("#contact-no").val(),
            "email": $(parentEle).find("#email").val(),
            "clientWebsite": $(parentEle).find("#client-website").val(),
            "clientAddress": $(parentEle).find("#client-address").val(),
            "clientState": $(parentEle).find("#client-state").val(),
            "clientLeadStatus": $(parentEle).find("#client-lead-status").val(),
            "dueDate": $(parentEle).find("#due-date").val(),
            "clientSales": $(parentEle).find("#client-sales").val(),

            "firstName": $(parentEle).find("#first-name").val(),
            "lastName": $(parentEle).find("#last-name").val(),
            "username": $(parentEle).find("#username").val(),
            "password": $(parentEle).find("#password").val(),            
        }

        $.ajax({
            type: "POST",
            url: "/update-db",
            data: params,
            success: function (data) {
                if(data && data.code == 200){
                    $('#'+curModalId).modal('hide')
                    var type = "success";   //info, success, warning, danger
                    var title = "Success";
                    var message = "User added!";
                    showMessage(type, title, message);
                    setTimeout(function(){
                        dismissMessage();
                    }, 5000);
                }else if(data && data.code == 400 && /(duplicate username)/.test(data.message)){
                    var type = "danger";   //info, success, warning, danger
                    var title = "Error";
                    var message = "Username already taken!";
                    showMessage(type, title, message);
                    setTimeout(function(){
                        dismissMessage();
                    }, 5000);
                }                
            },
            error: function (data) {
                $('#'+curModalId).modal('hide')
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
                    
                    var snoRows = $(table).find('tbody tr:not(.hide):not(#search) td.data-sno');
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


    $('#addClient').on('show.bs.modal', function (ele) {
        //To hide saving button
        $('#saving-btn').addClass('hide');
        $('#save-btn').removeClass('hide');

        var curClient = $(ele.relatedTarget).closest('tr[id]');
        $(ele.target).find('input').each(function(i, ele){
            var id = $(ele).attr('id');
            var value = $(curClient).find('.data-'+id).text();
            $(ele).val(value);
        });

    })

    $('#addClient').on('hidden.bs.modal', function (e) {
        console.log('hidden.bs.modal');
    })

    $('#addClient').on('hide.bs.modal', function (e) {
        console.log('hide.bs.modal');
    })

    $('#addClient').on('shown.bs.modal', function (e) {
        console.log('shown.bs.modal');
    })

    function dismissMessage() {
        const notification = document.querySelector('.notification');
        notification.classList.remove('received');
    }

    function showMessage(type, title, messageContent) {        
        const notification = document.querySelector('.notification');
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

    function toggleClass(ele, className){
        if($(ele).hasClass(className)){
            $(ele).removeClass(className);
        }else{
            $(ele).addClass(className);
        }
    }

});