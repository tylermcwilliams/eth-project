let Util = {};

Util.Pnt = function( x, y ) {
    Util.assertArgs( "Util.Pnt undefined params", x, y );
    return { x:x, y:y };
}

//throw error if args undefined
Util.assertArgs = function( msg, args ) {
    let a = 0;
    let arguments_length = arguments.length;

    for ( ; a < arguments_length; a++ ) {
        let arg = arguments[ a ];
        if ( typeof arg === "undefined" ) {
            if ( a === 0 ) {
                //doesn't account for passing another param here
                throw new Error( "No error msg provided to assertArgs" );
            } else {
                throw new Error( msg + " [" + a + "]" );
            }
        }
    }
}

Util.randomHexColor = function() {
    let color = "#";
    let char = 0;
    let char_length = 6;
    
    for ( ; char < char_length; char++ ) {
        //get a random number and convert it to hex
        let next_char = Math.floor( Math.random() * 16 ).toString( 16 );
        color += next_char;
    }
    return color;
}

Util.getPathFileName = function( path ) {
    let parse_path = path;
    return parse_path.split('\\').pop().split('/').pop();
}

Util.Hexagon = (( Pnt, assertArgs, randomHexColor ) => {
    assertArgs( "Hexagon params in IIFE", Pnt, randomHexColor );
    //define the dimension/frame and shape of the hexagon
    const frame = new Pnt( 4, 2 );
    const corners_preset = [
        new Pnt( 1, 0 ), new Pnt( 3, 0 ),
        new Pnt( 4, 1 ), new Pnt( 3, 2 ),
        new Pnt( 1, 2 ), new Pnt( 0, 1 )
    ];

    function pntsFromPos( pos, size_x ) {
        let corners = [];
        let frame_unit = unitFromWidth( size_x );
        corners_preset.map(( preset, p ) => {
            let corner_x = pos.x + ( preset.x * frame_unit );
            let corner_y = pos.y + ( preset.y * frame_unit );
            corners[ p ] = new Pnt( corner_x, corner_y );
        });
        
        return corners;
    }
    
    //get the size of the smallest interval in the shape
    function unitFromWidth( size_x ) {
        return size_x / frame.x;
    }

    //get full size of hexagon using a given width
    function sizeFromWidth( size_x ) {
        let frame_unit = unitFromWidth( size_x );
        return new Pnt( frame.x * frame_unit, frame.y * frame_unit );
    }

    //create a preset hexagon
    function ClassHexagon( pos, size_x ) {
        assertArgs( "Hexagon undefined params", pos, size_x );
        this.pos        = new Pnt( pos.x, pos.y );
        this.size       = sizeFromWidth( size_x );
        this.color      = randomHexColor();
        //each hexagons corner
        this.corners    = pntsFromPos( this.pos, this.size.x );
    }

    ClassHexagon.getPresetFrame = function() {
        return frame;
    }

    ClassHexagon.prototype.draw = function( ctx ) {
        this.corners.map(( corner, c ) => {
            if ( c === 0 ) {
                ctx.beginPath();
                ctx.moveTo( corner.x, corner.y );
            } else {
                ctx.lineTo( corner.x, corner.y );
            }
        });
        ctx.closePath();
    
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    ClassHexagon.prototype.drawAtOffset = function( ctx, offset ) {
        this.corners.map(( corner, c ) => {
            if ( c === 0 ) {
                ctx.beginPath();
                ctx.moveTo( corner.x + offset.x, corner.y + offset.y );
            } else {
                ctx.lineTo( corner.x + offset.x, corner.y + offset.y );
            }
        });
        ctx.closePath();
    
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    return ClassHexagon;
})( Util.Pnt, Util.assertArgs, Util.randomHexColor );

//define a game tile using the hexagon shape
//note, game classes containt parameters for gameplay
let GameObject = {};

GameObject.Tile = (( assertArgs ) => {

    let ClassTile = function( hexagon, special ) {
        assertArgs( "Tile undefined params", hexagon, special );
        this.shape = hexagon;
        //set special features of the tile, like id, image, etc
        this.special = special;
    }

    //quick higlighting function
    ClassTile.prototype.highlight = function( on ) {
        this.special.highlight = on;
        this.shape.color = "rgba( 255, 255, 255, 0.3 )";
    }


    ClassTile.prototype.drawAtOffset = function( ctx, offset ) {
        let this_pos = this.shape.pos;
        ctx.drawImage( this.special.img, this_pos.x + offset.x, this_pos.y + offset.y );
        
        if ( this.special.highlight === true) {
            this.shape.drawAtOffset( ctx, offset );
        }
    }

    return ClassTile;
})( Util.assertArgs );

let Game = (() => {
    return {

    }
})();

//store all the media in a singleton
Game.Media = {};
Game.Media.Imgs = {};
Game.Media.Imgs.files = {};
//note that these WILL NOT be accessible until initialization, do not pass the individual
//files into modules thus
Game.Media.Imgs.loadPaths = (( getPathFileName ) => {
    //load path images, callback progress is called to increment progress
    return function( paths, callback, callback_progress ) {
        let paths_length    = paths.length; 
        let loaded_counter  = 0;

        paths.map(( path, p ) => {
            let img         = new Image();
            let img_name    = getPathFileName( path );

            img.addEventListener( "load", () => {
                Game.Media.Imgs.files[ img_name ] = img;
                
                if ( callback_progress ) {
                    callback_progress();
                }
                
                loaded_counter++;
                if ( loaded_counter === paths_length ) {
                    console.log("All paths loaded");
                    callback();
                }
            });

            

            img.src = path;
        });
    
    }

})( Util.getPathFileName );

//callback on media ready
//NOTE: change this callback to an addeventlistener that checks if already complete
//make this call after the actual doc loads to avoid bugs

//alternative for logging gamestate changes with a switch
Game.Debugger = {};

//singleton that stores the game map
Game.TileMap = (( assertArgs, Pnt, Hexagon, Tile, Imgs ) => {
    assertArgs( "TileMap params in IIFE", Pnt, Hexagon, Tile, Imgs );
    //predefine the base unit and dimension/frame of the tilemap grid
    //note: this is not a standard grid and is hexagonal
    const frame = new Pnt( 16, 16 );
    const unit  = 64;
    
    let tile_id_count = 0;
    
    let map_tiles = [];

    //choose generate or choose loadfile
    //init state
    function init() {
        map_tiles = generateTiles();
    }

    function generateTiles() {
        let tiles = [];
        
        let col = 0;
        let col_length = frame.x;
        for ( ; col < col_length; col++ ) {
            tiles[ col ] = [];

            let row = 0;
            let row_length = frame.y;
            for ( ; row < row_length; row++ ) {
                //decide hexagon width
                let hexagon_frame   = Hexagon.getPresetFrame();
                let hexagon_width   = unit * hexagon_frame.x;
                let hexagon_height  = unit * hexagon_frame.y;
                
                //account for hexagon collumns overlapping in grid
                let hexagon_overlap_x   = unit * col;  
                let hexagon_x           = ( hexagon_width * col ) - hexagon_overlap_x;

                //account for collumn needing to be shifted downwards to fit grid
                let hexagon_shift_y = ( col % 2 ) * unit;
                let hexagon_y       = ( hexagon_height * row ) + hexagon_shift_y;

                let hexagon_pos = new Pnt( hexagon_x, hexagon_y );

                let hexagon = new Hexagon( hexagon_pos, hexagon_width );

                //tile special properties
                let special = {
                    id: tile_id_count++,
                    img: Imgs.files[ "land_grass_big.png" ],
                    highlight: false
                }
                let tile = new Tile( hexagon, special );
                tiles[ col ][ row ] = tile;
            }
        }
        return tiles;
    }

    //draw all tile shapes at a position within the canvas
    function drawShapes( ctx ) {
        map_tiles.map(( col, c ) => {
            col.map(( row, r ) => {
                let item = row;
                item.shape.draw( ctx );
            });
        });
    }

    //draw with tile image and specifications at an offset
    function drawTilesAtOffset( ctx, offset ) {
        let row = 0;
        let row_length = frame.y;

        //note: dont draw outside canvas for performance

        //account for tile images having an "underside"
        //note: this needs to be better resolved 
        let tile = {}; 

        for ( ; row < row_length; row++ ) {

            let col = 0;
            let col_length = frame.x;

            for ( ; col < col_length; col += 2 ) {
                tile = map_tiles[ col ][ row ];
                tile.drawAtOffset( ctx, offset );
            } 

            col = 1;
            for ( ; col < col_length; col += 2) {
                tile = map_tiles[ col ][ row ];
                tile.drawAtOffset( ctx, offset );
            }
        }
    }

    function drawShapesAtOffset( ctx, offset ) {
        map_tiles.map(( col, c ) => {
            col.map(( row, r ) => {
                let item = row;
                item.shape.drawAtOffset( ctx, offset );
            });
        });
    }

    //check whether position collides any tile and return it 
    function getTileAtPos( pos ) {
        assertArgs( "getTileAtPos undefined params", pos );
        let tile_frame = Hexagon.getPresetFrame();
        //account for the bounding box of a tile overlapping in the grid
        let tile_size_with_overlap_x = ( tile_frame.x * unit ) - unit;
        let tile_size_y = tile_frame.y * unit;
//         = new Pnt( ( tile_frame.x * unit ) - unit, tile_frame.y * unit );

        /*
        depending on the garbage collector,
        we might benefit by moving these variables as state variables to a 
        closure (forp erformance)
        */

        //account the row position for a collumn being shifted
        let col_at_pos      = Math.floor( pos.x / tile_size_with_overlap_x );
        let unit_at_pos_x   = Math.floor( pos.x / unit );
        let col_shift       = ( col_at_pos % 2 );
        let row_at_pos      = Math.floor( ( pos.y - unit * col_shift ) / tile_size_y );
        let unit_at_pos_y   = Math.floor( pos.y / unit );
        
        let col = -1;
        let row = -1;
        //then decide if colliding center
        //else handle slope collision
        //check if out of bounds
        //return

        //position is within the overlapping hexagon area
        // 0 === collision at hex slope
        // 1, 2 === collision at center

        let collision_at_hex_slope = unit_at_pos_x % 3;
        if ( collision_at_hex_slope > 0 ) {
            //collision at hex center with no overlap
            col = col_at_pos;
            row = row_at_pos;
        } else {
            //collision at overlap with slopes
            
            //check if slope is facing down or up
            //0 = down, 1 = up
            let slope_direction = ( unit_at_pos_y + col_shift ) % 2;

            let tile_pos_x = col_at_pos * unit;
            let tile_pos_y = row_at_pos * unit;
            let pos_in_slope_bounding_box_x = pos.x - tile_size_with_overlap_x * col_at_pos;
            let pos_in_slope_bounding_box_y = pos.y - tile_size_y * row_at_pos - ( unit * col_shift ) - ( unit * slope_direction );

            if ( slope_direction == 0 ) {
                if ( pos_in_slope_bounding_box_y < unit - pos_in_slope_bounding_box_x ) {
                    col = col_at_pos - 1;
                    row = row_at_pos - 1 * !col_shift;
                } else {
                    col = col_at_pos;
                    row = row_at_pos;
                }
            } else {
                if ( pos_in_slope_bounding_box_y > pos_in_slope_bounding_box_x ) {
                    col = col_at_pos - 1;
                    row = row_at_pos + 1 * col_shift; 
                } else {
                    col = col_at_pos;
                    row = row_at_pos;
                }
            }
        }

        //pos outside the bounds of the tilemap
        if ( ( col < 0 || col > frame.x - 1 ) || ( row < 0 || row > frame.y - 1 ) ) {
            return undefined;
        }

        return map_tiles[ col ][ row ];
    }

    //load tiles according to predefined size
    //note: this needs to be replaced with a read/write function
    //store the map externally
    return {
        tiles: map_tiles,
        drawShapes: drawShapes,
        drawShapesAtOffset: drawShapesAtOffset,
        drawTilesAtOffset: drawTilesAtOffset,
        getTileAtPos: getTileAtPos,
        init: init
    }

})( Util.assertArgs, Util.Pnt, Util.Hexagon, GameObject.Tile, Game.Media.Imgs );

function index() {
    Game.TileMap.init();

    let Pnt     = Util.Pnt;
    
    let canvas  = document.getElementById( "canvas-a" );
    let context = canvas.getContext( "2d" );
    let screen  = document.getElementById( "screen" );

    let canvas_bounding_box = context.canvas.getBoundingClientRect();
    
    //let images = Media.images.get;
    //console.log( images );
    
    let mouse_pos_old   = new Pnt( 0, 0 );
    let mouse_pos       = new Pnt( 0, 0 );
    
    let old_collided_tile = undefined;
    
    let mouse_offset = new Pnt( 0, 0 );
    
    //initial draw
    Game.TileMap.drawTilesAtOffset( context, mouse_offset );
    
    let zoom_on = new Pnt( 0.5, 0.5 );
    let zoom_off = new Pnt( 1 / zoom_on.x, 1 / zoom_on.y );
    
    let zoom_toggle = false;

    let mouse_down = false;
    context.canvas.addEventListener( "mousedown", ( e ) => {
        
        if ( e.button == 0 ) {
            mouse_down = true;
        }

        if ( e.button == 2 ) {
            if ( zoom_toggle ) {
                zoom_toggle = !zoom_toggle;
                context.scale( zoom_off.x, zoom_off.y );
            } else {
                zoom_toggle = !zoom_toggle;
                context.scale( zoom_on.x, zoom_on.y );
            }
        }
        
        return false;
    });
    
    
    window.addEventListener( "mouseup", ( e ) => {
        if ( e.button == 0 ) {
            mouse_down = false;
        }
        
    });

    window.addEventListener( "contextmenu", ( e ) => {
        e.preventDefault();
    });
    
    window.addEventListener( "mousemove", ( e ) => {
        mouse_pos_old = new Pnt( mouse_pos.x, mouse_pos.y );
        mouse_pos.x = e.clientX - canvas_bounding_box.left;
        mouse_pos.y = e.clientY - canvas_bounding_box.top;
        
        if ( zoom_toggle ) {
            mouse_pos.x *= zoom_off.x;
            mouse_pos.y *= zoom_off.y;
        }
        
        let mouse_pos_with_offset = new Pnt( mouse_pos.x - mouse_offset.x, mouse_pos.y - mouse_offset.y );
        let collided_tile = Game.TileMap.getTileAtPos( mouse_pos_with_offset );

        if ( mouse_down ) {
            let mouse_diff_x = mouse_pos.x - mouse_pos_old.x;
            let mouse_diff_y = mouse_pos.y - mouse_pos_old.y;

            if ( zoom_toggle ) {
                mouse_offset.x += mouse_diff_x * zoom_off.x;
                mouse_offset.y += mouse_diff_y * zoom_off.y;
            } else {
                mouse_offset.x += mouse_diff_x;
                mouse_offset.y += mouse_diff_y;
            }
        }
        

        //highlight the selected tile, this can be made a tile function
        if ( collided_tile ) {
            if ( old_collided_tile ) {
                if ( collided_tile.special.id !== old_collided_tile.special.id ) {
                    old_collided_tile.highlight( false );
                    collided_tile.highlight( true );
                    old_collided_tile = collided_tile;
                }  
            } else {
                old_collided_tile = collided_tile;
                collided_tile.highlight( true );
            }
        }
        
        

    });


    //add a fallback function for older browsers

    let redrawMap;
    redrawMap =  function() {
        if ( zoom_toggle ) {
            context.clearRect( 0, 0, context.canvas.width * zoom_off.x, context.canvas.height * zoom_off.x );
        } else {
            context.clearRect( 0, 0, context.canvas.width, context.canvas.height );
        }
        Game.TileMap.drawTilesAtOffset( context, mouse_offset );
        window.requestAnimationFrame( redrawMap );
    }

    window.requestAnimationFrame( redrawMap );

    //little stuff for the html sketch
    spaghettiMenu();

}

function spaghettiMenu() {
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
}

document.addEventListener( "DOMContentLoaded", () => {
    
    //add a loading indicator

    //initialize media 
    setTimeout(() => {
        //initialize this through a Game.init() object
        
        let img_source = "./img/";
        let paths = [
            img_source + "land_grass_big.png",
            img_source + "land_grass_mini.png",
            img_source + "army_mock_img.png"
        ]

        Game.Media.Imgs.loadPaths( paths, index );

    }, 500);
});
