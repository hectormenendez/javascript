/**
 * GIRUP ajax file uploader
 * Enables file sending without reloading when clicking given element.
 *
 * v2R3 2011/MAY/08 Héctor Menéndez <h@cun.mx>
 *
 * @returns sends callback with server's html response.
 *
 * @note the parent element should have: overflow:hidden;
 * @note any extra parameter will be sent as post var.
 *
 * @todo Remove all console calls.
 * @todo Intenet Explorer, fallback.
 *
 * @log added stop propagation for form submit, to avoid firing other forms. [2011/AGO/06]
 * @log fixed reiteration bug.
 * @log removed unneeded code.
 * @log Rewritten the whole thing.
 * @log Confirmed to work on Opera 11, Chrome 10+, FF3.5+, Safari 4+
 * @log The user doesn't need to declare css for this anymore.
 * @log changed onBeforeClick for change
 * @log added mouseover and mouseout callbacks.
 */
(function($){ jQuery.fn.girup = function(settings){ return this.each(function(i, elem){

	// set this to true when implemeting, you'll thank me. [2011/AGO/06]
	var log = true;

	if (typeof settings !== 'object') settings = {};
	// verify required settings
	if (typeof settings.url != 'string')
		return log? console.log('Specify an URL!') : false;
	if (typeof settings.callback != 'function')
		return log? console.log('Specify a Callback!') : false;

	var girup = {};

    // events
	girup.reset = function(firsttime){
		$('.girup').remove();
		$doc = $body = $form = $file = $frame = $hidden = name = undefined;
		$tmp = $(elem).blur();
		if (firsttime===undefined) {
			if (log) console.log('reset');
			$tmp.girup(settings);
		}
		else if (log && firsttime === true) console.log('set');
	}
	girup.reset(true);

	// main objects
	var $this  = $(this);
	var $root  = $this.parent();

    var rootpos = $root.css('position');
    if (rootpos != 'relative' && rootpos != 'absolute')
    	return !log? false : console.log("target's Parent must be either absolute or relative positioned.");

    var $form  = $('<form class="girup" action="'+settings.url+'" target="girup" method="post" enctype="multipart/form-data">');
    var $file  = $('<input name="file" type="file">').appendTo($form);
    var $frame = $('<iframe name="girup"></iframe>').appendTo($form);
    var $hidden = []; // extra vars as hidden inputs.
    var name;
    for (name in settings){
    	if (name=='url' || name=='callback' || name=='file') continue;
    	if (typeof settings[name] == 'function') continue;
    	$hidden.push($('<input type="hidden" name="'+name+'" value="'+settings[name]+'">').appendTo($form));
    }

    var fileselected = false;

	// attached to original object
	girup.mouseover = function(e){
		$this.unbind('mouseover', girup.mouseover);
		if (typeof settings.mouseover== 'function') settings.mouseover(e, $file[0]);
		if (log) console.log('mouseover');
		var rW = $root.width();
		var rH = $root.height();
		var tW = $this.width();
		var tH = $this.height();
		var pos = $this.position();
		$form.appendTo($root);
		$form.submit(function(e){ e.stopPropagation(); })
		//$this.wrap($form);
		// style elements
	    $form.css({ display:'block', position:'absolute', overflow:'hidden', zIndex:'9999', top:0, left:0, width:rW, height:rH });
	    tmp = $form.find('*').css({ display:'block', position:'absolute'});
	    tmp.not($file[0]).css({ left:'-300em', top:'-300em' });
	    $file.css({ opacity:0, cursor:'pointer', height:tH+'px', lineHeight:tH+'px', fontSize:tH+'px' });
		$file.css({ left:(-1*$file.width())+tW, top:0 })	

		$file.bind('mousedown', girup.mousedown);
		$file.bind('mouseout',  girup.mouseout);
	    return true;
	}

	girup.mouseout = function(e){
		$file.unbind('mouseout', girup.mouseout);
		if (typeof settings.mouseout== 'function') settings.mouseout(e, $file[0]);
		if (log) console.log('mouseout');
		girup.reset();
		return true;
	}

	// attached to $file
	girup.mousedown = function(){
		$file.unbind('mousedown', girup.mousedown);
		$file.unbind('mouseout', girup.mouseout);
		if (log) console.log('mousedown');
		$file.trigger('focus');
		// cancel bubble if the user returns false onBeforeClick
        if (typeof settings.onBeforeClick == 'function' && !settings.onBeforeClick())
        	return false;
        // Now we listen for changes. Either the user clicks cancel, or choses a file.
        $file.bind('blur', girup.blur);
        $file.bind('change', girup.change);
	    return false;
	}
  
	// user choses a file.
	girup.change = function(e){
		$file.unbind('change', girup.change);
		fileselected = true;
		$form.submit();
		if (log) console.log('change',settings);
		// start loader [if any]
        if (typeof settings.change == 'function') settings.change(e, $file[0]);
        // and wait for the content to load
        $frame.bind('load', girup.load);
        return false;
	};

	girup.load = function(x, y, z){
		$frame.unbind('load', girup.load);
		data = $(this).contents().find('body').html();
		if (log) console.log('load',data);
		// send response
		settings.callback(data, $this[0]);
        // start all over
        girup.reset();
        return false;
	}

	girup.blur = function(e){
		$file.unbind('blur', girup.blur);
		if (log) console.log('blur');
		fileblurred = true;
		filefocused = false;
		$(window).bind('focus', girup.focus);
		return false;
	}

	girup.focus = function(e){
		$(window).unbind('focus', girup.focus);
		if (!fileselected) {
			if (log) console.log('cancel');
	        if (typeof settings.cancel == 'function') settings.cancel(e, $file[0]);
			girup.reset();
		} else {
			if (log) console.log('focus',$('.girup iframe').contents().find('body'));
		}
		return true;
	}

	$this.bind('mouseover', girup.mouseover);

	return elem;

});}})(jQuery);

