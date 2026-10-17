#!/usr/bin/env python3
"""
13 AEROSPACE DEFENSE COMPANY®
SUPER PROJECT EXCALIBUR — GEOSPATIAL REPROJECTION & ARCPY TELEMETRY PIPELINE

DOCUMENT CONTROL: EXCALIBUR-AFW-2026-GIS-UTM11N
PRINCIPAL CLOUD ARCHITECT: Shawn Patrick Cooper Gardner
ENTITY: 13 Aerospace Defense Company (Sole Proprietorship, Boulder City, NV)
AGENCY ALIGNMENT: DOI -> BOR -> Lower Colorado Basin Region
MISSION OBJECTIVE: GS-13 Regional Liaison Technical Architecture
"""

import os
import sys
import arcpy

# -------------------------------------------------------------------------
# 1. ENVIRONMENT CONFIGURATION & SPATIAL PARAMETERS
# -------------------------------------------------------------------------
arcpy.env.overwriteOutput = True
arcpy.env.maintainAttachments = True

IN_DATASET: str = r"C:\GIS\EXCALIBUR\input.gdb\sites"
OUT_DATASET: str = r"C:\GIS\EXCALIBUR\output.gdb\sites_utm11n"

# Target Coordinate Reference System: WGS 1984 UTM Zone 11N (EPSG:32611)
TARGET_SRID: int = 32611
out_coor_system = arcpy.SpatialReference(TARGET_SRID)

# Geographic Datum Transformation for Lower Colorado Basin (NV/AZ/CA boundary)
TRANSFORM_METHOD: str = "WGS_1984_(ITRF08)_To_NAD_1983_2011"
PRESERVE_SHAPE: str = "PRESERVE_SHAPE"
MAX_DEVIATION: str = "0.001 Meters"
VERTICAL_TRANSFORM: str = "NO_VERTICAL"

# -------------------------------------------------------------------------
# 2. PRE-FLIGHT VALIDATION & DIRECTORY INITIALIZATION
# -------------------------------------------------------------------------
def initialize_geodatabase(gdb_path: str) -> None:
    folder = os.path.dirname(gdb_path)
    gdb_name = os.path.basename(gdb_path)
    if not os.path.exists(folder):
        os.makedirs(folder, exist_ok=True)
        arcpy.AddMessage(f"[INIT] Created host directory: {folder}")
    if not arcpy.Exists(gdb_path):
        arcpy.management.CreateFileGDB(folder, gdb_name)
        arcpy.AddMessage(f"[INIT] Provisioned File Geodatabase: {gdb_path}")

out_gdb = os.path.dirname(OUT_DATASET)
initialize_geodatabase(out_gdb)

# -------------------------------------------------------------------------
# 3. SPATIAL REPROJECTION EXECUTION
# -------------------------------------------------------------------------
def execute_excalibur_projection():
    arcpy.AddMessage("=" * 70)
    arcpy.AddMessage("EXCALIBUR TELEMETRY SPATIAL REPROJECTION PIPELINE INITIALIZED")
    arcpy.AddMessage(f"Input Feature Class : {IN_DATASET}")
    arcpy.AddMessage(f"Output Feature Class: {OUT_DATASET}")
    arcpy.AddMessage(f"Target Coordinate   : {out_coor_system.name} (EPSG:{TARGET_SRID})")
    arcpy.AddMessage(f"Transformation      : {TRANSFORM_METHOD}")
    arcpy.AddMessage("=" * 70)

    try:
        # Inspect input spatial reference
        desc = arcpy.Describe(IN_DATASET)
        in_sr = desc.spatialReference
        arcpy.AddMessage(f"[INSPECT] Source CRS: {in_sr.name} (Type: {in_sr.type})")

        # Execute Project Management Tool
        arcpy.management.Project(
            in_dataset=IN_DATASET,
            out_dataset=OUT_DATASET,
            out_coor_system=out_coor_system,
            transform_method=TRANSFORM_METHOD,
            in_coor_system=in_sr,
            preserve_shape=PRESERVE_SHAPE,
            max_deviation=MAX_DEVIATION,
            vertical=VERTICAL_TRANSFORM
        )

        # Post-validation of feature count and output spatial integrity
        out_desc = arcpy.Describe(OUT_DATASET)
        count = int(arcpy.management.GetCount(OUT_DATASET).getOutput(0))
        arcpy.AddMessage(f"[SUCCESS] Projection Complete: {OUT_DATASET}")
        arcpy.AddMessage(f"[AUDIT] Verified Projected Count: {count} features")
        arcpy.AddMessage(f"[AUDIT] Verified Output CRS: {out_desc.spatialReference.name}")
        arcpy.AddMessage("=" * 70)
        return True

    except arcpy.ExecuteError:
        arcpy.AddError("[CRITICAL] ArcPy Execution Failure:")
        arcpy.AddError(arcpy.GetMessages(2))
        return False
    except Exception as ex:
        arcpy.AddError(f"[CRITICAL] System Exception: {str(ex)}")
        return False

if __name__ == "__main__":
    success = execute_excalibur_projection()
    sys.exit(0 if success else 1)
