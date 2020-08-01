$(function()                                                                                                                                                         
    {
    click_sound = new Audio('https://spawner.xyz/wifi_socket/click.mp3');

    state = 0;

    refresh_time = 20000;
    get_relay_state ();                                                                                                                                                      

    init_gauge (100);

    $('.refresh_btn').click(function()                                                                                                                                       
        {
        get_relay_state ();
        });

    $('.main_button input').change(function()                                                                                                                                       
        {
        play_click();
        input_obj = $(this);                                                                                                                                           
        state = $(input_obj).attr('data-state');
//        console.log (state);
        draw_timer_button (0, 0, 0, 0);

        $.post( '/toggle_switch.php', {data: state},  function( result ) 
            {
            state = (state == 1) ? 0:1;
            draw_button (state);
            });                                                                                                                                                          
                                                                                                                                                                     
        return false;                                                                                                                                                
        });                                                                                                                                                          


    $('.input_row .btn, .settings_btn, .settings .close').click(function(){
        $('.settings').toggleClass('active');
    })


    // Set timer
    $('#timer_toggle').click(function()
        {
        var time_0 = $('#time_0').val();
        $.post( '/set_timer.php', {time_0: time_0},  function( result ) {
            var time_milisec_0 = minutes_to_miliseconds (time_0);
            draw_timer_button (time_milisec_0, time_milisec_0, 0, 0);
            });
        });

    // Set cycle
    $('#timer_cycle').click(function()
        {
        var time_1 = $('#time_1').val();
        var time_2 = $('#time_2').val();
        $.post( '/set_cycle.php', {time_1: time_1, time_2: time_2},  function( result ) {
            var time_milisec_1 = minutes_to_miliseconds (time_1);
            var time_milisec_2 = minutes_to_miliseconds (time_2);
            draw_timer_button (time_milisec_1, time_milisec_1, time_milisec_2, 1);
            });
        });

    });                                                                                                                                                              

function get_relay_state ()
    {
    $.post( '/get_relay_state.php', function( result ) {                                                                                                     
        arr = result.split (',');
        state       = arr[0]; // Текущее состояние кнопки
        time_left   = arr[1]; // Оставшееся время таймера
        time_total  = arr[2]; // Полное время таймера
        time_next   = arr[3]; // Следущее время таймера (при работе в цикле)
        mode        = arr[4]; // Режим работы (0 - таймер, 1 - цикл)
        
        draw_button (state);
        draw_timer_button (time_left, time_total, time_next, mode);
        init_refresh_bar ();
        });                                                                                                                                                          
    }


function init_gauge (percent_left)
    {
    console.log ('State = ' + state);
    console.log ('Percent left = ' + percent_left);

    var angle_direction = 1;

    if (state == 0) // Включен 
        {
        angle_direction = 1;
//        percent_left = 100 - percent_left;
        }

    var total_bars = 60;
    var angle_step = Math.round (360 / total_bars * angle_direction);

    var total_bars_left = Math.round (total_bars / (100 / percent_left));

    var html_gauge = '';
    for (var i = 0; i <= total_bars_left; i++)
        {
        var rotate_angle = i * angle_step;
        html_gauge = html_gauge + "<div class=bar style='transform: rotate(" + rotate_angle + "deg)'></div>";
        }


    $('.gauge').html(html_gauge);

    // Animate on startup - countdown
    if (percent_left == 100) 
        {
        $('.gauge .bar').hide();
        bar_startup_animation (1, total_bars_left);
        }
    
    
    }

function hide_gauge ()
    {
    $('.gauge').html('');
    }



function bar_startup_animation (nx_bar_id, total_bars)
    {
    var nx_bar = $('.gauge .bar:eq(' + nx_bar_id + ')');
    $(nx_bar).fadeIn(10, function() {
        nx_bar_id++;
        if (nx_bar_id <= total_bars)
            bar_startup_animation (nx_bar_id, total_bars);
        });
        
    }


function init_refresh_bar ()
    {
    $('.refresh_bar').stop().css('width', '0').animate(
        {
        width: '100%'
        }, refresh_time, 'linear', function ()
            {
            get_relay_state ();
            });
    }


function draw_button (state)
    {
    input_obj = $('.main_button input');

    if (state == 0)
        {
        $(input_obj).prop('checked', false);
        $('.state_text').text('Выключен').removeClass('on').addClass('off');
        $('.timer_mess').text('');
        $('.settings .word_1').text('включить');
        $('.settings .word_2').text('выключить');
        }
    else    
        {
        $(input_obj).prop('checked', true);
        $('.state_text').text('Работает').removeClass('off').addClass('on');
        $('.settings .word_1').text('выключить');
        $('.settings .word_2').text('включить');
        }

    $(input_obj).attr('data-state', state);
    }

function draw_timer_button (time_left, time_total, time_next, mode)
    {
    console.log ('State      = ' + state);
    console.log ('Mode       = ' + mode);
    console.log ('Time left  = ' + time_left);
    console.log ('Time total = ' + time_total);
    console.log ('Time next  = ' + time_next);

    state_mess_obj = $('.timer_mess');                                                                                                                                           

    var button_text = '';

    percent_left = 0;

    if (time_left > 1)
        {
        percent_left = Math.round (time_left / time_total * 100);
        button_text = create_time_text (time_left, state, 0);
        init_gauge (percent_left);
        }
    else
        {
        hide_gauge ();
        }

    if (mode == 1)
        {
        if (time_next > 1)
            {
            var new_state = (state == 1) ? 0 : 1;
            button_text_next = create_time_text (time_next, new_state, 1);
            
            button_text = '<div class=hint>Работа в цикле</div>' + button_text + '<div class=time_next><div class=and_then>а потом</div>' + button_text_next + '</div>';
            }
        }

    $(state_mess_obj).html(button_text);

    if (percent_left == 100)
        $(state_mess_obj).hide().fadeIn(2000);

    }


function create_time_text (time_ms, state, mode)
    {
    var word_1 = (state == 1) ? 'выключен' : 'включен' ;
    var word_2 = (mode  == 0) ? 'через' : 'на' ;


    var time_left_min = milisec_to_min (time_ms);
    if (time_left_min >= 1)
        {
        minutes_word = declOfNum(time_left_min, [['минуту'],['минуты'],['минут']]);
        button_text = 'Будет ' + word_1 + ' ' + word_2 + ' ' + time_left_min + ' ' + minutes_word;
        }
    else
        {
        var time_left_sec = milisec_to_sec (time_ms);
        seconds_word = declOfNum(time_left_sec, [['cекунду'],['секунды'],['секунд']]);
        button_text = 'Будет ' + word_1 + ' ' + word_2 + ' ' + time_left_sec + ' ' + seconds_word;
        }
    return button_text;        
    }


function milisec_to_min (value)
    {
    value = Math.round (value / 60000);
    return value;
    }
function milisec_to_sec (value)
    {
    value = Math.round (value / 1000);
    return value;
    }
function minutes_to_miliseconds (time_minutes)
    {
    var time_milliseconds = Math.round(time_minutes * 60000);
    return time_milliseconds;
    }
function declOfNum(number, titles) {  
    cases = [2, 0, 1, 1, 1, 2];  
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
} 

function play_click () 
    {
    click_sound.play();
    }
