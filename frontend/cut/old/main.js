document.addEventListener( "DOMContentLoaded", function() {
    onPageReady();
    //onPageReady()
});

function onPageReady() {
    const canvas    = document.getElementById( "canvas-a" );
    const context   = canvas.getContext( "2d" );

    //context.canvas.width = window.innerWidth;
    //context.canvas.height = window.innerHeight;

    let mouse_pos       = new Pnt( 0, 0 );
    
    //initial first draw
    //put this on a media-onload
    setTimeout(() => {
        HexagonMap.draw( context );
    }, 500);
    
    //add seperate js layer for menu and interface?
    
    //temporary spaghetti code
    const menu = document.getElementsByClassName( "menu-sel" );
    
    let m = 0;
    let menu_length = menu.length;
    
    for ( ; m < menu_length; m++ ) {
        let el = menu[ m ];
        el.onclick = function() {
            let _m = 0;
            for ( ; _m < menu_length; _m++ ) {
                let _el = menu[ _m ];
                let _name = _el.textContent;
                document.getElementById( _name + "-window" ).style.display = "none";
            }
            
            let name = el.textContent;
            document.getElementById( name + "-window" ).style.display = "block";
        };
    }
    //
    
    let prev_sel_hex = {};
    let prev_color = "";
    canvas.onmousemove = function( e ) {
        mouse_pos = new Pnt( e.offsetX, e.offsetY );
        
        let sel_hex = HexagonMap.getCollided( mouse_pos );

        if ( !sel_hex ) {
            return;
        }

        
        if ( prev_sel_hex.id !== sel_hex.id ) {


            prev_sel_hex.color = prev_color;

            prev_sel_hex = sel_hex;
            prev_color = sel_hex.color;
            sel_hex.color =  "rgba( 255, 255, 255, 1 )";

            context.clearRect( 0, 0, context.canvas.width, context.canvas.height );
            HexagonMap.draw( context );
            
        }
    }
}