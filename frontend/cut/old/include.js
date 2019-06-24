// -> globals
//when possible, verify arguments as defined for classes and objects
// ??? perhaps do not use this for per-frame invoked functions ( not certain on the performance hit )
function checkArg( arg ) {
    return ( typeof arg !== "undefined" );
}

function assertArgs( msg, arg_count, args_ ) {
    let a = 0;
    let arg_length = arguments.length;

    for ( ; a < arg_length; a++ ) {
        let arg = arguments[ a ];

        if ( !checkArg( arg ) ) {

            if ( a === 0 ) {
                throw new Error( "Error message not defined" );
            } else {
                throw new Error( msg );
            }

        }
    }
}

const assertArgType = (function() {
    const types = {
        pnt: 2
    }

    return function( msg, type, args ) {
        if ( types[ type ] !== args.length ) {
            throw new Error( msg );
        }
    }
}());

//namespace these and pass through iife
// <- globals

function randomHexColor() {
    let color = "#";
    let char = 0;
    let char_length = 6;
    
    for ( ; char < char_length; char++ ) {
        let next_char = Math.floor( Math.random() * 16 ).toString( 16 );
        color += next_char;
    }
    return color;
}

function Pnt( x, y ) {
    assertArgs( "Undefined arguments at Pnt", x, y );
    this.x = x;
    this.y = y;
}

function Grid( unit, frame ) {
    assertArgs( "Undefined arguments at Grid", unit, frame );
    this.unit   = unit;
    this.frame  = frame;
}

//MOVE THINGS TO IIFE 

const Hexagon = (function( ) {
    let id_counter = 0;

    //the frame that defines the hexagons size in units
    //note that this is hardcoded and the hexagon class implicitly uses a 1:1 ratio for the slopes, the shape stays static
    const frame = new Pnt( 4, 2 );

    //defines each corners_chain corner in the hex, starting from the top-left coordinate of the hexes bounding box
    const corners_chain = [
        new Pnt( 1, 0 ),    new Pnt( 2, 0 ),
        new Pnt( 1, 1 ),    new Pnt( -1, 1),
        new Pnt( -2, 0 ),   new Pnt( -1, -1 )
    ];
    
    //defines actual location of each corner
    const corners = [
        new Pnt( 1, 0 ), new Pnt( 3, 0 ),
        new Pnt( 4, 1 ), new Pnt( 3, 2 ),
        new Pnt( 1, 2 ), new Pnt( 0, 1 )
    ];

    function calcSize( unit ) {
        return new Pnt( frame.x * unit, frame.y * unit );
    }

    const ClassHexagon = function( pos, unit, color ) {

        assertArgs( "Undefined arguments at Hexagon", pos, unit, color );
        this.id     = id_counter++;
        this.pos    = pos;
        this.color  = color;
        this.frame  = frame;
        this.size   = calcSize( unit );

        this.corners = [];
        corners.map(function( e, i ) {
            this.corners[ i ] = new Pnt( e.x, e.y );
        }.bind(this));

        this.corners_chain = [];
        corners_chain.map(function( e, i ) {
            this.corners_chain[ i ] = new Pnt( e.x, e.y );
        }.bind(this));
        
        this.scale( unit );
    }

    ClassHexagon.getFrame = function() {
        return new Pnt( frame.x, frame.y );
    }

    return ClassHexagon;
}());

Hexagon.prototype.draw = function( ctx ) {
    assertArgs( "Undefined arguments at Hexagon.draw", ctx );
    this.corners.map(function( e, i ) {
        if ( i === 0 ) {
            ctx.beginPath();
            ctx.moveTo( e.x, e.y );
        } else {
            ctx.lineTo( e.x, e.y ); 
        }
    });

    ctx.closePath();

    if ( this.color != null ) {
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    
}

Hexagon.prototype.move = function( pos ) {
    assertArgs( "Undefined arguments at Hexagon.move", pos );
    //not needed atm
}

Hexagon.prototype.place = function( pos ) {
    assertArgs( "Undefined arguments at Hexagon.place", pos );
    //... recalculate points based on a new pos
    let next_corner = new Pnt( pos.x, pos.y );
    this.corners_chain.map(function( e, i ) {
        next_corner.x += e.x;
        next_corner.y += e.y;
        this.corners[ i ] = new Pnt( next_corner.x, next_corner.y );
    }.bind(this));
}

Hexagon.prototype.scale = function( unit ) {
    assertArgs( "Undefined arguments at Hexagon.scale", unit );
    let frame = Hexagon.getFrame();

    this.size = new Pnt( frame.x * unit, frame.y * unit );
    this.corners_chain.map(function( e ) {
        e.x *= unit;
        e.y *= unit;
    });
    //re-place the hexagon
    this.place( this.pos );
}

Hexagon.prototype.test = function() {

}

/*
const HexagonTile = (function() {
    return function( pos, unit, color ) {
        this.hexagon = new Hexagon( pos, unit, color );

    }
})
*/

const HexagonMap = (function () {
    const grid  = new Grid( 64, new Pnt( 4, 4 ) );
    const items = [];
    createItems();

    //beautiful math
    function createItems() {
        let c = 0;
        let col_length = grid.frame.x;
        for ( ; c < col_length; c++) {
            items[ c ] = [];
            let r = 0;
            let row_length = grid.frame.y;
            for ( ; r < row_length; r++ ) {
                let frame = Hexagon.getFrame();

                //calculate the placement of the hexagons
                //handle overlaping slopes
                let hex_size_x          = grid.unit * frame.x * c;
                let hex_slope_overlap   = grid.unit * c;

                //account for every second row being shifted downwards
                let hex_size_y          = grid.unit * frame.y * r;
                let col_shift           = grid.unit * ( c % 2 );
 
                let pos =  new Pnt( hex_size_x - hex_slope_overlap, hex_size_y + col_shift );

                let color = randomHexColor();
                let item = new Hexagon( pos, grid.unit, color, null );
                items[ c ][ r ] = item;
            }
        }
    }

    function getCollided( pos ) {
        let col = -1;
        let row = -1;

        let hex_frame = Hexagon.getFrame();

        let pos_on_unit_x   = Math.floor( pos.x / grid.unit );
        let pos_on_unit_y   = Math.floor( pos.y / grid.unit );


        //0     for slopes
        //1, 2  for hexagon centers 
        let collision_overlaps = pos_on_unit_x % ( hex_frame.x - 1 );
        //console.log(collision_overlaps);

        
        //let collided_hex_pos = new Pnt( ( hex_frame.x - 1 ) * grid.unit * collided_col, hex_frame.y * grid.unit * collided_row - grid.unit * col_shift );

        if ( collision_overlaps > 0 ) {
            let collided_col    = Math.floor( pos_on_unit_x / ( hex_frame.x - 1 ) );
        
            //account for every second row being shifted downwards
            let col_shift       = collided_col % 2;
            let collided_row    = Math.floor( ( pos_on_unit_y - col_shift ) / hex_frame.y );

            col = collided_col;
            row = collided_row;
        } else {
            let collided_col = Math.floor( pos_on_unit_x / ( hex_frame.x - 1 ) );
            let col_shift    = collided_col % 2;
            
            let collided_row = Math.floor( ( pos_on_unit_y - col_shift ) / hex_frame.y );
            
            col = collided_col;
            row = collided_row;
        
            //0 == slope downwards, 1 == slope upwards. 
            //0 == /^^^|/^^^|/... down
            //1 == \___|\___|\... up
            //the overlapped_col has the opposite value
            let hex_slope_type = ( ( pos_on_unit_y + col_shift ) % 2 );

            //check if we should use the previous col

            //console.log( "CCOL " +  collided_col );
            //console.log( "CROW " + collided_row );
            
            let collided_hex_pos_x = collided_col * ( hex_frame.x - 1 ) * grid.unit;
            let collided_hex_pos_y = collided_row * hex_frame.y * grid.unit + ( grid.unit * col_shift );
            //console.log ( "TEST " + collided_hex_pos_y);

            //console.log( "CPOSX " + collided_hex_pos_x );
            //console.log( "CPOSY " + collided_hex_pos_y ); 
            //let pos_on_slope_x = pos.x - collided_hex_pos.x;
            //new Pnt( pos.x - collided_hex_pos.x, pos.y - collided_hex_pos.y - ( grid.unit * col_slope_type ) );

            let pos_on_slope_x = pos.x - collided_hex_pos_x;
            let pos_on_slope_y = pos.y - collided_hex_pos_y - hex_slope_type * grid.unit;

            //correctly select previous hex
            let previous_col = collided_col - 1;
            let previous_row = Math.floor( ( pos_on_unit_y - !col_shift ) / hex_frame.y );


            let upper_slope_overlap_collides = ( ( hex_slope_type == 0 ) && ( pos_on_slope_y < grid.unit - pos_on_slope_x ) );
            let lower_slope_overlap_collides = ( ( hex_slope_type == 1 ) && ( pos_on_slope_y > pos_on_slope_x ) );

            if ( upper_slope_overlap_collides || lower_slope_overlap_collides )
            {
                col = previous_col;
                row = previous_row;
            }
        }
        
        let collision_exceeds_collumns  = ( col < 0 ) || ( col > grid.frame.x-1 );
        let collision_exceeds_rows      = ( row < 0 ) || ( row > grid.frame.y-1 );
        
        if ( collision_exceeds_collumns || collision_exceeds_rows ) {
            return undefined;
        } 

        return items[ col ][ row ];
    }

    function draw( ctx, debug ) {
        let r           = 0;
        let row_length  = grid.frame.y;

        for ( ; r < row_length; r++ ) {            
            let c           = 0;
            let col_length  = grid.frame.x;

            for ( ; c < col_length; c += 2 ) {
                let item = items[ c ][ r ];
                item.draw(ctx);
            }

            c = 1;
            for ( ; c < col_length; c += 2 ) {
                let item = items[ c ][ r ];
                item.draw(ctx);
            }
        }
    }



    return {
        items: items,
        grid: grid,
        draw: draw,
        getCollided: getCollided
    }
}());

/*
const Screen = (function() {
    let offset = new Pnt( 0, 0 );
}());
*/

//clean up code