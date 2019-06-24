/*


const Media = (function() {

    function getPathFileName( path ) {
        let parse_path = path;
        return parse_path.split('\\').pop().split('/').pop();
    }

    function MediaImage( path, name, callback ) {
        assertArgs( "Missing args at Image", path );
        this.path       = path;
        this.name       = name;
        this.img        = new Image();
    
        this.img.onload = callback;
        this.img.src = path;
    }

    function loadImages( paths, onReady ) {
        let files = {};

        let loaded_files = 0;
        let files_length = paths.length;

        paths.map(function( path, i ) {
            let file_name = getPathFileName( path );
            files[ i ] = new MediaImage( path, file_name, function() {
                loaded_files++;
                if ( loaded_files === files_length-1) {
                    return function() {
                        onReady( files );
                    }
                }
            });
        });
    }

    return {
        loadImagesByPath: loadImages,
        Image: MediaImage
    }
}());




*/



/*
Media.images.onready;
//bool if media ready
Media.images.isready;
Media.images.get = (( getPathFileName ) => {
    
    const paths_to_load = [
        "./img/land_grass_big.png",
        "./img/army_mock_img.png"
    ]; 

    let path_length         = paths_to_load.length;
    let path_loaded_count   = 0;
    
    let loaded_images       = {};

    paths_to_load.map(( path, p ) => {
        let img = new Image();
        img.onload = () => {
            let file_name = getPathFileName( path );
            loaded_images[ file_name ] = img;
            path_loaded_count++;

            //if complete loading
            if ( path_loaded_count >= path_length ) {
                //call onready fn if available
                Media.images.isready = true;
                if ( typeof Media.images.onready !== "undefined" ) {
                    Media.images.onready();
                }

            }
        }

        img.src = path;
    });

    return loaded_images;
})( Util.getPathFileName );
*/