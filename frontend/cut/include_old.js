//this is expected everywhere
//wrap these in const

function makePnt( x, y ) {
    return { x: x, y: y }
}

function Grid( unit, size ) {
    this.unit = unit;
    this.size = size;
}

function randomHexColor() {
    let hex_color = "#";
    let color = 0;
    let color_length = 6;
    for ( ; color < color_length; color++ ) {
        hex_color += Math.floor( Math.random() * 16 ).toString( 16 );
    }
    return hex_color;
}

//define the standard for hexagon
const Hexagon = ( function() {
    let id_counter = 0;
    const size = makePnt( 4, 2 )
    const pnts = [
        makePnt( 1, 0 ), makePnt( 2, 0 ),  makePnt( 1, 1 ),
        makePnt( -1, 1 ), makePnt( -2, 0 ), makePnt( -1, -1 )
    ];

    function calcPntsByLocation( loc, unit ) {
        let result = [];
        let next_loc = makePnt( loc.x, loc.y )
        let i = 0;
        let pnt_length = pnts.length;
        for ( ; i < pnt_length; i++ ) {
            let pnt = pnts[ i ];
            next_loc.x += (pnt.x * unit);
            next_loc.y += (pnt.y * unit);
            result[ i ] = makePnt( next_loc.x, next_loc.y )
        }
        return result;
    }

    function ClassHexagon( pos, unit ) {
        this.color = randomHexColor();
        this.id = id_counter++;
        this.pos = pos;
        this.size = makePnt( size.x * unit, size.y * unit );
        this.pnts = calcPntsByLocation( pos, unit );
    }
    
    ClassHexagon.prototype.draw = function( ctx ) {
        let p = 0;
        let pnts_length = this.pnts.length;
        let next_pos = makePnt( this.pos.x, this.pos.y );
        for ( ; p < pnts_length; p++ ) {
            let pnt = this.pnts[ p ];
            next_pos.x += pnt.x;
            next_pos.y += pnt.y;
            if ( p === 0 ) {
                ctx.beginPath();
                ctx.moveTo( next_pos.x, next_pos.y );
            } else {
                ctx.lineTo( next_pos.x, next_pos.y );
            }
        }
        ctx.fill();
    
    } 
    return ClassHexagon;

}());
//make grid makepnt are basically structs

//hex map singleton
const HexMap = (function( Hex, Grid ) {
    const grid = new Grid( 32, makePnt( 8, 5 ) );
    const items = createItems();
    //using

    function createItems() {
        let result = [];
        let next_loc = makePnt( 0, 0 );
        let col = 0;
        let col_length = grid.size.x;
        for ( ; col < col_length; col++ ) {
            result[ col ] = [];
            let row = 0;
            let row_length = grid.size.y;
            for ( ; row < row_length; row++ ) {
                let item = new Hex( next_loc, grid.unit );
                result[ col ][ row ] = item;
                next_loc = makePnt( col * item.size.x, row * item.size.y );
            }
        }
        return result;
    }

    //interface
    return {
        print: function() {
            console.log(items);
        },
        drawMap: function( ctx ) {
            let col = 0;
            let col_length = grid.size.x;
            for ( ; col < col_length; col++ ) {
                let row = 0;
                let row_length = grid.size.y;
                for ( ; row < row_length; row++ ) {
                    let item = items[ col ][ row ];
                    item.draw( ctx );
                }
            }
        }
    }
}( Hexagon, Grid ));