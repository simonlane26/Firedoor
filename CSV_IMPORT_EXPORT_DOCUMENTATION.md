# CSV Import/Export Documentation

## Overview
Comprehensive CSV import/export system for bulk data operations with buildings, fire doors, and inspections.

---

## Features

✅ **Bulk Import Buildings** - Import multiple buildings from CSV
✅ **Bulk Import Fire Doors** - Import multiple fire doors from CSV
✅ **Export All Data** - Export buildings, doors, and inspections to CSV
✅ **CSV Templates** - Download pre-formatted templates with examples
✅ **Import Guide** - Reference guide with all valid values
✅ **Validation** - Comprehensive validation with detailed error reporting
✅ **Duplicate Detection** - Prevents duplicate entries
✅ **Error Handling** - Clear error messages with row numbers
✅ **Role-Based Access** - Only Admins and Managers can import

---

## Access Control

**Import Permissions:**
- ✅ **ADMIN** - Can import buildings and fire doors
- ✅ **MANAGER** - Can import buildings and fire doors
- ❌ **INSPECTOR** - Cannot import (read-only access)

**Export Permissions:**
- ✅ All authenticated users can export data

---

## Components

### 1. CSV Import Service
**File:** [lib/csv-import.ts](lib/csv-import.ts)

#### Functions:

**`importBuildingsFromCSV(csvData: string, tenantId: string, managerId: string): Promise<BuildingImportResult>`**
- Parses CSV data using PapaParse
- Validates each row for required fields and data types
- Checks for duplicate building names within tenant
- Creates buildings in database
- Returns detailed result with success count and errors

**`importFireDoorsFromCSV(csvData: string, tenantId: string): Promise<FireDoorImportResult>`**
- Parses CSV data for fire door records
- Validates door data and fire ratings
- Looks up buildings by name
- Checks for duplicate door numbers within building
- Creates fire doors linked to existing buildings
- Returns detailed result with success count and errors

#### Validation Rules:

**Buildings:**
- `name` - Required, non-empty string
- `address` - Required, non-empty string
- `postcode` - Required, non-empty string
- `buildingType` - Required, must be one of: RESIDENTIAL, COMMERCIAL, MIXED_USE, INDUSTRIAL, PUBLIC
- `numberOfStoreys` - Optional, positive integer if provided
- `contactEmail` - Optional, valid email format if provided

**Fire Doors:**
- `doorNumber` - Required, non-empty string
- `location` - Required, non-empty string
- `buildingName` - Required, must match existing building name exactly
- `fireRating` - Required, must be one of: FD30, FD60, FD90, FD120
- `doorType` - Required, must be one of: FLAT_ENTRANCE, COMMUNAL_STAIRWAY, COMMUNAL_CORRIDOR, RISER_CUPBOARD, METER_CUPBOARD, OTHER
- `installationDate` - Optional, must be in YYYY-MM-DD format if provided

---

### 2. CSV Export Service
**File:** [lib/csv-export.ts](lib/csv-export.ts)

#### Functions:

**`exportBuildingsToCSV(buildings: BuildingExportData[]): string`**
- Converts building data to CSV format
- Includes all building fields plus total door count
- Returns CSV string ready for download

**`exportFireDoorsToCSV(doors: FireDoorExportData[]): string`**
- Converts fire door data to CSV format
- Includes door details, building name, inspection status
- Shows last inspection result and next inspection date
- Returns CSV string ready for download

**`exportInspectionsToCSV(inspections: InspectionExportData[]): string`**
- Converts inspection data to CSV format
- Includes all inspection findings and results
- Shows inspector name and action required status
- Returns CSV string ready for download

**`generateBuildingTemplate(): string`**
- Creates CSV template with example building data
- Two sample rows to demonstrate format
- All required and optional columns included

**`generateFireDoorTemplate(): string`**
- Creates CSV template with example fire door data
- Two sample rows showing different door types
- All required and optional columns included

**`generateImportGuide(): string`**
- Creates reference guide with all valid values
- Lists building types, fire ratings, door types
- Shows required vs optional fields
- Includes format examples

---

### 3. API Endpoints

#### **POST /api/csv/import/buildings**
**File:** [app/api/csv/import/buildings/route.ts](app/api/csv/import/buildings/route.ts)

Imports buildings from CSV file.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field containing CSV file
- Auth: Required (ADMIN or MANAGER)

**Response:**
```json
{
  "success": true,
  "imported": 15,
  "failed": 2,
  "errors": [
    {
      "row": 5,
      "error": "Building with name 'Tower A' already exists",
      "data": { ... }
    },
    {
      "row": 12,
      "error": "Building type must be one of: RESIDENTIAL, COMMERCIAL, ...",
      "data": { ... }
    }
  ]
}
```

---

#### **POST /api/csv/import/doors**
**File:** [app/api/csv/import/doors/route.ts](app/api/csv/import/doors/route.ts)

Imports fire doors from CSV file.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field containing CSV file
- Auth: Required (ADMIN or MANAGER)

**Response:**
```json
{
  "success": false,
  "imported": 48,
  "failed": 3,
  "errors": [
    {
      "row": 15,
      "error": "Building 'Tower B' not found. Please create the building first.",
      "data": { ... }
    },
    {
      "row": 27,
      "error": "Door 'FD-001' already exists in building 'Tower A'",
      "data": { ... }
    }
  ]
}
```

---

#### **GET /api/csv/export/buildings**
**File:** [app/api/csv/export/buildings/route.ts](app/api/csv/export/buildings/route.ts)

Exports all buildings to CSV.

**Response:**
- Content-Type: `text/csv`
- Filename: `buildings-export-YYYY-MM-DD.csv`

**Columns:**
- name, address, postcode, buildingType
- numberOfStoreys, contactName, contactEmail, contactPhone
- totalDoors, createdAt

---

#### **GET /api/csv/export/doors**
**File:** [app/api/csv/export/doors/route.ts](app/api/csv/export/doors/route.ts)

Exports all fire doors to CSV.

**Response:**
- Content-Type: `text/csv`
- Filename: `fire-doors-export-YYYY-MM-DD.csv`

**Columns:**
- doorNumber, location, buildingName, fireRating, doorType
- manufacturer, installationDate
- lastInspectionDate, lastInspectionResult
- nextInspectionDate, status, notes

---

#### **GET /api/csv/export/inspections**
**File:** [app/api/csv/export/inspections/route.ts](app/api/csv/export/inspections/route.ts)

Exports all inspections to CSV.

**Response:**
- Content-Type: `text/csv`
- Filename: `inspections-export-YYYY-MM-DD.csv`

**Columns:**
- inspectionDate, doorNumber, location, buildingName, fireRating
- inspector, status, overallResult
- doorConstruction, certificationProvided, damageOrDefects
- doorClosesCompletely, frameGapsAcceptable, hingesSecure
- actionRequired, actionDescription

---

#### **GET /api/csv/templates?type={type}**
**File:** [app/api/csv/templates/route.ts](app/api/csv/templates/route.ts)

Downloads CSV templates and guides.

**Parameters:**
- `type` - One of: `buildings`, `doors`, `guide`

**Response:**
- Content-Type: `text/csv`
- Filename varies by type

**Examples:**
```
GET /api/csv/templates?type=buildings
→ building-import-template.csv

GET /api/csv/templates?type=doors
→ fire-door-import-template.csv

GET /api/csv/templates?type=guide
→ import-guide.csv
```

---

### 4. CSV Import/Export Page
**File:** [app/csv/page.tsx](app/csv/page.tsx)

Interactive UI for bulk data operations.

**Features:**
- File upload for buildings and fire doors
- Real-time import status with progress
- Detailed error reporting with row numbers
- Export buttons for all data types
- Template download buttons
- Import guide with valid values
- Role-based access control display

**Sections:**
1. **Import Buildings** - Upload CSV and import buildings
2. **Import Fire Doors** - Upload CSV and import fire doors
3. **Export Data** - Download buildings, doors, or inspections
4. **Import Guide** - Reference for valid values

---

## Usage Guide

### Importing Buildings

1. **Download Template**
   - Visit [http://localhost:3000/csv](http://localhost:3000/csv)
   - Click "Download Template" under Import Buildings
   - Open template in Excel or text editor

2. **Fill in Data**
   ```csv
   name,address,postcode,buildingType,numberOfStoreys,contactName,contactEmail,contactPhone
   Tower Block A,123 High Street,SW1A 1AA,RESIDENTIAL,12,John Smith,john@example.com,020 1234 5678
   Office Building,456 Main Road,EC1A 1BB,COMMERCIAL,8,Jane Doe,jane@example.com,020 9876 5432
   ```

3. **Upload CSV**
   - Click "Upload Buildings CSV"
   - Select your filled CSV file
   - Click "Import Buildings"
   - Wait for import to complete

4. **Review Results**
   - Check success/failure count
   - Review any errors listed
   - Fix errors and re-import failed rows if needed

---

### Importing Fire Doors

**⚠️ Important:** Buildings must exist before importing doors!

1. **Ensure Buildings Exist**
   - Import buildings first (see above)
   - Or manually create buildings via UI
   - Note the exact building names

2. **Download Template**
   - Visit [http://localhost:3000/csv](http://localhost:3000/csv)
   - Click "Download Template" under Import Fire Doors

3. **Fill in Data**
   ```csv
   doorNumber,location,buildingName,fireRating,doorType,manufacturer,installationDate,notes
   FD-001,Ground Floor Flat 1,Tower Block A,FD30,FLAT_ENTRANCE,Fire Door Co,2023-01-15,New installation
   FD-002,Ground Floor Stairwell,Tower Block A,FD60,COMMUNAL_STAIRWAY,Safety Doors Ltd,2023-01-15,
   ```

   **Important:**
   - `buildingName` must match existing building name EXACTLY
   - Case-sensitive matching
   - Include all punctuation and spacing exactly as stored

4. **Upload and Import**
   - Upload CSV file
   - Click "Import Fire Doors"
   - Review results

---

### Exporting Data

**Export Buildings:**
```
Visit /csv → Click "Export Buildings"
Downloads: buildings-export-2024-12-16.csv
```

**Export Fire Doors:**
```
Visit /csv → Click "Export Fire Doors"
Downloads: fire-doors-export-2024-12-16.csv
```

**Export Inspections:**
```
Visit /csv → Click "Export Inspections"
Downloads: inspections-export-2024-12-16.csv
```

**Use Cases:**
- Backup data regularly
- Share data with stakeholders
- Import into Excel for analysis
- Migrate data to another system
- Create reports in external tools

---

## CSV Format Examples

### Building Import Template

```csv
name,address,postcode,buildingType,numberOfStoreys,contactName,contactEmail,contactPhone
Example Building A,123 High Street,SW1A 1AA,RESIDENTIAL,12,John Smith,john.smith@example.com,020 1234 5678
Example Building B,456 Main Road,EC1A 1BB,COMMERCIAL,8,Jane Doe,jane.doe@example.com,020 9876 5432
```

**Required Fields:** name, address, postcode, buildingType
**Optional Fields:** numberOfStoreys, contactName, contactEmail, contactPhone

---

### Fire Door Import Template

```csv
doorNumber,location,buildingName,fireRating,doorType,manufacturer,installationDate,notes
FD-001,Ground Floor Flat 1,Example Building A,FD30,FLAT_ENTRANCE,Fire Door Co,2023-01-15,New installation
FD-002,Ground Floor Stairwell,Example Building A,FD60,COMMUNAL_STAIRWAY,Safety Doors Ltd,2023-01-15,
FD-003,First Floor Flat 2,Example Building A,FD30,FLAT_ENTRANCE,Fire Door Co,2023-01-15,
FD-101,Main Entrance,Example Building B,FD60,COMMUNAL_CORRIDOR,SafeDoor Inc,2023-02-01,
```

**Required Fields:** doorNumber, location, buildingName, fireRating, doorType
**Optional Fields:** manufacturer, installationDate, notes

---

### Building Export Format

```csv
name,address,postcode,buildingType,numberOfStoreys,contactName,contactEmail,contactPhone,totalDoors,createdAt
Tower Block A,123 High Street,SW1A 1AA,RESIDENTIAL,12,John Smith,john@example.com,020 1234 5678,45,2024-12-01
Office Building,456 Main Road,EC1A 1BB,COMMERCIAL,8,Jane Doe,jane@example.com,020 9876 5432,23,2024-12-02
```

---

### Fire Door Export Format

```csv
doorNumber,location,buildingName,fireRating,doorType,manufacturer,installationDate,lastInspectionDate,lastInspectionResult,nextInspectionDate,status,notes
FD-001,Ground Floor Flat 1,Tower Block A,FD30,FLAT_ENTRANCE,Fire Door Co,2023-01-15,2024-11-15,PASS,2025-11-15,Compliant,
FD-002,Ground Floor Stairwell,Tower Block A,FD60,COMMUNAL_STAIRWAY,Safety Doors Ltd,2023-01-15,2024-10-01,FAIL,2025-01-01,Failed,Requires repair
FD-003,First Floor Flat 2,Tower Block A,FD30,FLAT_ENTRANCE,,2023-01-15,,,2024-12-01,Overdue,
```

---

## Valid Values Reference

### Building Types
- `RESIDENTIAL` - Residential buildings (apartments, flats)
- `COMMERCIAL` - Commercial buildings (offices, shops)
- `MIXED_USE` - Mixed residential and commercial
- `INDUSTRIAL` - Industrial facilities
- `PUBLIC` - Public buildings (schools, hospitals)

### Fire Ratings
- `FD30` - 30-minute fire door
- `FD60` - 60-minute fire door
- `FD90` - 90-minute fire door
- `FD120` - 120-minute fire door

### Door Types
- `FLAT_ENTRANCE` - Entrance door to individual flat (12-month inspection cycle)
- `COMMUNAL_STAIRWAY` - Door in communal stairway (3-month inspection cycle)
- `COMMUNAL_CORRIDOR` - Door in communal corridor (3-month inspection cycle)
- `RISER_CUPBOARD` - Riser cupboard door (3-month inspection cycle)
- `METER_CUPBOARD` - Meter cupboard door (3-month inspection cycle)
- `OTHER` - Other fire door types (3-month inspection cycle)

### Date Format
- All dates must be in `YYYY-MM-DD` format
- Example: `2024-12-16`

---

## Error Handling

### Common Import Errors

**"Building with name 'X' already exists"**
- **Cause:** Duplicate building name in your tenant
- **Solution:** Use a unique name or update existing building

**"Building 'X' not found. Please create the building first."**
- **Cause:** Importing doors for non-existent building
- **Solution:** Import buildings first, ensure exact name match

**"Door 'X' already exists in building 'Y'"**
- **Cause:** Duplicate door number within same building
- **Solution:** Use unique door numbers per building

**"Building type must be one of: RESIDENTIAL, COMMERCIAL, ..."**
- **Cause:** Invalid building type value
- **Solution:** Use exact values from valid list (case-sensitive)

**"Fire rating must be one of: FD30, FD60, FD90, FD120"**
- **Cause:** Invalid fire rating
- **Solution:** Use exact values from valid list

**"Door type must be one of: FLAT_ENTRANCE, COMMUNAL_STAIRWAY, ..."**
- **Cause:** Invalid door type
- **Solution:** Use exact values from valid list (case-sensitive)

**"Installation date must be in format YYYY-MM-DD"**
- **Cause:** Invalid date format
- **Solution:** Use YYYY-MM-DD format (e.g., 2024-12-16)

**"Number of storeys must be a positive number"**
- **Cause:** Invalid number or negative value
- **Solution:** Enter positive integer only

**"Invalid email format"**
- **Cause:** Malformed email address
- **Solution:** Use valid email format: user@domain.com

---

## Best Practices

### Before Importing

1. **Backup existing data** - Export current data before bulk import
2. **Validate CSV file** - Open in Excel to check formatting
3. **Test with small batch** - Import 2-3 rows first to verify
4. **Check building names** - Ensure exact match for door imports
5. **Remove special characters** - Avoid smart quotes, unusual punctuation

### During Import

1. **Watch for errors** - Review error messages carefully
2. **Note row numbers** - Errors reference CSV row numbers
3. **Fix and retry** - Correct errors and re-import failed rows
4. **Don't duplicate imports** - Avoid importing same data twice

### After Import

1. **Verify data** - Check imported records in UI
2. **Review statistics** - Confirm expected number of records
3. **Test functionality** - Ensure imported data works correctly
4. **Document changes** - Keep log of bulk import operations

---

## Security Considerations

### Access Control
- Only ADMIN and MANAGER roles can import
- All users can export (tenant-isolated)
- Session authentication required for all operations

### Data Validation
- Comprehensive validation on all fields
- SQL injection prevention via Prisma ORM
- File type checking (CSV only)
- Size limits on uploaded files

### Tenant Isolation
- All imports/exports are tenant-specific
- Cannot import data to other tenants
- Cannot export data from other tenants
- Building/door associations verified per tenant

---

## Troubleshooting

### Import Not Working

1. **Check File Format**
   ```bash
   # File should be .csv
   # Not .xlsx, .xls, or .txt
   ```

2. **Check Permissions**
   - Verify you're logged in as ADMIN or MANAGER
   - INSPECTOR role cannot import

3. **Check File Encoding**
   - Use UTF-8 encoding
   - Avoid special characters if possible

4. **Check Column Headers**
   - Must match exactly (case-sensitive)
   - No extra spaces or typos

### Export Returns Empty File

1. **Check Tenant Setup**
   - Ensure tenant is configured
   - Verify you have data to export

2. **Check Browser**
   - Allow downloads in browser settings
   - Check downloads folder

### Building Name Not Matching

**Problem:** "Building 'Tower A' not found"

**Solution:**
```csv
# Export buildings first to see exact names
GET /api/csv/export/buildings

# Use exact name from export:
doorNumber,location,buildingName
FD-001,Floor 1,"Tower Block A"  ← Use exact name
```

---

## Performance

### Import Speed
- Buildings: ~100-200 per second
- Fire Doors: ~50-100 per second (slower due to building lookup)
- Affected by database size and server performance

### Large Imports
For very large imports (1000+ rows):
1. Split into smaller batches (500 rows each)
2. Import during off-peak hours
3. Monitor server resources
4. Consider using database direct import for 10,000+ rows

---

## Future Enhancements

- [ ] Import inspections from CSV
- [ ] Bulk update existing records
- [ ] Excel (.xlsx) file support
- [ ] Import preview before commit
- [ ] Scheduled imports via cron
- [ ] Import history and rollback
- [ ] Column mapping for flexible CSV formats
- [ ] Import validation mode (dry-run)
- [ ] Progress bar for large imports
- [ ] Email notification on import completion

---

## Summary

The CSV import/export system is now fully operational with:

✅ Bulk import for buildings and fire doors
✅ Export for buildings, doors, and inspections
✅ Downloadable templates with examples
✅ Comprehensive validation and error reporting
✅ Role-based access control
✅ Tenant isolation for security
✅ User-friendly UI with clear feedback

**Access the system at:** [http://localhost:3000/csv](http://localhost:3000/csv)
