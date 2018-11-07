function setState(state){
    var callback = function() {
        _finalizeState(state)
    };
    if(state != "description"){
        $(".description").fadeOut(callback);
    }else if(state != "model"){
        $(".model").fadeOut(callback);
    }
}

function _finalizeState(state){
    if(state == "description"){
        $(".description").fadeIn();
    }else if(state == "model"){
        $(".model").fadeIn();
    }
}

function establishState(){
    $(".model").hide();
    $(".description").hide();
    var url = new URL(window.location.href);
    var text = url.searchParams.get("text");
    if(text != null){
        setState("model");
    }else{
        setState("description");
    }
}