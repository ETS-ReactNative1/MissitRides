import arcpy
ws = arcpy.env.workspace = r"path/to/workspace"
fc = r"path/to/shapefile"
feat_to_points = arcpy.FeatureVerticesToPoints_management (fc, "feat_to_points", "ALL")

arcpy.AddField_management (feat_to_points, "Lat", "FLOAT")
arcpy.AddField_management (feat_to_points, "Long", "FLOAT")

wgs = arcpy.SpatialReference(4326)
with arcpy.da.UpdateCursor(feat_to_points, ['SHAPE@', 'Lat', 'Long']) as cursor:
    for row in cursor:
        pnt_wgs = row[0].projectAs(wgs)
        row[1:] = [pnt_wgs.centroid.Y, pnt_wgs.centroid.X] 
        rows.updateRow(row)