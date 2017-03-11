/**
 * @author Trilogis Srl
 * @author Gustavo German Soria
 *
 * Way DAO queries module
 */

/**
 * Retrieve a polygon object with its properties and tags by providing its identifier.
 *
 * It requires the following parameters:
 *
 * 1: bigint -> identifier.
 *
 * @returns {string} the query string
 */
var getPolygonByOsmId = function(){
    var _query = "SELECT array_to_json(array_agg(pol)) as way, ST_AsGeoJSON(way) as geom FROM (osm_polygon NATURAL JOIN polygon_style_properties) as pol WHERE osm_id = $1::bigint AND is_deleted = false GROUP BY way";
    //console.log(_query);
    return _query;
}

var getPolygonInfoByOsmId = function(){
    var _query = "SELECT info FROM object_data WHERE ID = $1::bigint";
    return _query;
}

var postObjectInfoByOsmIDUpdate = function(){
    var _query = "UPDATE object_data SET info=$2 WHERE ID=$1"
    return _query;
}

var postObjectInfoByOsmIDInsert = function(){
    var _query = "INSERT INTO object_data (ID, info) SELECT ($1::bigint, $2::json) WHERE NOT EXISTS (SELECT 1 FROM object_data WHERE ID=$1)"
    return _query;
}

/**
 * Retrieves a polyline object with its properties and tags by providing its identifier.
 *
 * It requires the following parameters:
 *
 * 1: bigint -> identifier.
 *
 * @returns {string} the query string
 */
var getPolylineByOsmId = function(){
    var _query = "SELECT array_to_json(array_agg(pol)) as way, ST_AsGeoJSON(way) as geom FROM (osm_line NATURAL JOIN line_style_properties) as pol WHERE osm_id = $1::bigint AND is_deleted = false GROUP BY way "+
                 "UNION ALL "+
                 "SELECT array_to_json(array_agg(pol)) as way, ST_AsGeoJSON(way) as geom FROM (osm_roads NATURAL JOIN line_style_properties) as pol WHERE osm_id = $1::bigint AND is_deleted = false GROUP BY way";
    return _query;
}

/**
 * Retrieve polygons (each of them with its properties and tags included) by providing a bounding box.
 * If some parts of the geometries are not in the selected bounding box, then the geometries are cut and only the parts
 * within the bounding box are maintained.
 *
 * It requires the following parameters:
 * 1: bigint    ->  latitude lower bound;
 * 2: bigint    ->  longitude lower bound;
 * 3: bigint    ->  latitude upper bound;
 * 4: bigint    ->  longitude upper bound;
 * 5: integer   ->  level of detail;
 *
 * @returns {string} the query
 */
var getPolygonsByBbox = function(list){

    var excludeString = "";
    if (list && list.length > 0){
        excludeString = "AND osm_id NOT IN ("+fromList2String(list)+")";
    }

    var _query = "SELECT *, ST_AsGeoJSON(geomm) as geom " +
        "FROM (	SELECT * " +
        "FROM (	SELECT osm_id, type_id, ST_Intersection(osm_polygon.way, bbox.geom) as geomm " +
        "FROM osm_polygon, (SELECT ST_SetSRID(ST_MakeBox2d(ST_MakePoint($1::float, $2::float), ST_MakePoint($3::float, $4::float)), 4326) as geom) as bbox " +
    "WHERE ST_Intersects(osm_polygon.way, bbox.geom) AND type_id > 0 AND is_deleted = false "+excludeString+") " +
    "fc ) as t NATURAL JOIN polygon_style_properties WHERE lod <= $5::integer";
    //console.log(_query);
    return _query;
}


var getPointsByBbox = function(list){

    //var excludeString = "";
    //if (list && list.length > 0){
    //    excludeString = "AND osm_id NOT IN ("+fromList2String(list)+")";
    //}

    var _query = "SELECT type_id, osm_id, ST_AsGeoJSON(way) as geom, type_key, type_value, color_fill, lod " +
        "FROM osm_point NATURAL JOIN point_style_properties " +
        "WHERE " +
        "osm_point.way && " +
        "ST_Transform(ST_MakeEnvelope($1::float, $2::float, $3::float, $4::float, 4326), 4326) AND type_id > 0 AND is_deleted = false AND lod <= $5::integer;"

    //var _query = "SELECT type_id, osm_id, ST_AsGeoJSON(way), type_key, type_value, color_fill, lod " +
    //"FROM osm_point NATURAL JOIN point_style_properties " +
    //"WHERE " +
    //"osm_point.way && " +
    //"ST_Transform(ST_MakeEnvelope($1::float, $2::float, $3::float, $4::float, 4326), 4326) " +
    //    "AND type_id > 0 AND is_deleted = false " +
    //    "AND lod <= $5::integer;";

    //var _query = "SELECT *, ST_AsGeoJSON(geomm) as geom " +
    //    "FROM (	SELECT * " +
    //    "FROM (	SELECT osm_id, type_id, ST_Intersection(osm_point.way, bbox.geom) as geomm " +
    //    "FROM osm_point, (SELECT ST_SetSRID(ST_MakeBox2d(ST_MakePoint($1::float, $2::float), ST_MakePoint($3::float, $4::float)), 4326) as geom) as bbox " +
    //    "WHERE ST_Intersects(osm_point.way, bbox.geom) AND type_id > 0 AND is_deleted = false "+excludeString+") " +
    //    "fc ) as t NATURAL JOIN point_style_properties WHERE lod <= $5::integer";
    //console.log(_query);
    return _query;
}

/**
 * Retrieve lines (each of them with its properties and tags included) by providing a bounding box.
 * If some parts of the geometries are not in the selected bounding box, then the geometries are cut and only the parts
 * within the bounding box are maintained.
 *
 * It requires the following parameters:
 * 1: bigint    ->  latitude lower bound;
 * 2: bigint    ->  longitude lower bound;
 * 3: bigint    ->  latitude upper bound;
 * 4: bigint    ->  longitude upper bound;
 * 5: integer   ->  level of detail;
 *
 * @returns {string} the query
 */
var getPolylinesByBbox = function(list){

    var excludeString = "";
    if (list && list.length > 0){
        excludeString = "AND osm_id NOT IN ("+fromList2String(list)+")";
    }

    //var _query = "SELECT *, ST_AsGeoJSON(geomm) as geom FROM (SELECT * FROM (SELECT osm_id, type_id, ST_Intersection(osm_roads.way, bbox.geom) as geomm FROM osm_roads, (SELECT ST_SetSRID(ST_MakeBox2d(ST_MakePoint($1::float, $2::float), ST_MakePoint($3::float, $4::float)), 4326) as geom) as bbox WHERE is_deleted = false AND ST_Intersects(osm_roads.way, bbox.geom)) fc ) as t NATURAL JOIN line_style_properties WHERE lod <= $5::integer " +
    //"UNION " +
    //"SELECT *, ST_AsGeoJSON(geomm) as geom FROM (SELECT * FROM (SELECT osm_id, type_id, ST_Intersection(osm_line.way, bbox.geom) as geomm FROM osm_line, (SELECT ST_SetSRID(ST_MakeBox2d(ST_MakePoint($1::float, $2::float), ST_MakePoint($3::float, $4::float)), 4326) as geom) as bbox WHERE is_deleted = false "+excludeString+" AND ST_Intersects(osm_line.way, bbox.geom)) fc ) as t NATURAL JOIN line_style_properties WHERE lod <= $5::integer ";
    //
    //return _query;


    var _query = "SELECT *, ST_AsGeoJSON(geomm) as geom " +
        "FROM (	SELECT * " +
        "FROM (	SELECT osm_id, type_id, ST_Intersection(osm_line.way, bbox.geom) as geomm " +
        "FROM osm_line, (SELECT ST_SetSRID(ST_MakeBox2d(ST_MakePoint($1::float, $2::float), ST_MakePoint($3::float, $4::float)), 4326) as geom) as bbox " +
        "WHERE ST_Intersects(osm_line.way, bbox.geom) AND type_id > 0 AND is_deleted = false "+excludeString+") " +
        "fc ) as t NATURAL JOIN line_style_properties WHERE lod <= $5::integer";
    //console.log(_query);
    return _query;
}

var getPolylinesByName = function(){

    return "SELECT *, ST_AsGeoJSON(way) as geom FROM osm_line WHERE name = $1::varchar AND is_deleted = false";
}

var fromList2String = function (list){

    var string = "";

    var flagFirstEntry = true;

    list.forEach(function(entry){
        if (flagFirstEntry){
            string += entry;
            flagFirstEntry = false;
        } else {
            string += ', '+entry;
        }
    });

    return string;
}

module.exports.getPolygonByOsmId = getPolygonByOsmId;
module.exports.getPolygonInfoByOsmId = getPolygonInfoByOsmId;
module.exports.getPolylineByOsmId = getPolylineByOsmId;
module.exports.getPolygonsByBbox = getPolygonsByBbox;
module.exports.getPolylinesByBbox = getPolylinesByBbox;
module.exports.getPolylinesByName = getPolylinesByName;
module.exports.postObjectInfoByOsmID = postObjectInfoByOsmID;
module.exports.postObjectInfoByOsmIDUpdate = postObjectInfoByOsmIDUpdate;
module.exports.postObjectInfoByOsmIDInsert = postObjectInfoByOsmIDInsert;
module.exports.getPointsByBbox = getPointsByBbox;
