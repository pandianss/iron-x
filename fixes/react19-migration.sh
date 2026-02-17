#!/bin/bash
# REACT 19 MIGRATION SCRIPT
# Converts React.FC usage to React 19 compatible function components
# Usage: bash react19-migration.sh

set -e

echo "🔄 React 19 Migration Script"
echo "=============================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -d "frontend/src" ]; then
    echo -e "${RED}❌ Error: Must run from iron-x-main directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📊 Analyzing React.FC usage...${NC}"
echo ""

# Find all files with React.FC
AFFECTED_FILES=$(find frontend/src -name "*.tsx" -type f -exec grep -l "React\.FC" {} \;)
FILE_COUNT=$(echo "$AFFECTED_FILES" | grep -c "^" || echo "0")

echo -e "${BLUE}Found $FILE_COUNT files using React.FC${NC}"
echo ""

if [ "$FILE_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ No files need migration!${NC}"
    exit 0
fi

echo -e "${YELLOW}Files to migrate:${NC}"
echo "$AFFECTED_FILES" | sed 's/^/  - /'
echo ""

# Create backup directory
BACKUP_DIR="frontend/src-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📦 Creating backup in $BACKUP_DIR...${NC}"
cp -r frontend/src/* "$BACKUP_DIR/"
echo -e "${GREEN}✅ Backup created${NC}"
echo ""

echo -e "${YELLOW}🔧 Starting migration...${NC}"
echo ""

# Migration patterns
MIGRATED_COUNT=0

while IFS= read -r file; do
    if [ -z "$file" ]; then
        continue
    fi
    
    echo -e "${BLUE}Processing: $file${NC}"
    
    # Create a temporary file
    TEMP_FILE=$(mktemp)
    
    # Pattern 1: React.FC<{ children: React.ReactNode }>
    # Convert to: ({ children }: { children: React.ReactNode })
    sed -E 's/: React\.FC<\{ children: React\.ReactNode \}> = \(\{ children \}\)/({ children }: { children: React.ReactNode })/g' "$file" > "$TEMP_FILE"
    mv "$TEMP_FILE" "$file"
    
    # Pattern 2: React.FC<{ children: ReactNode }>
    sed -E 's/: React\.FC<\{ children: ReactNode \}> = \(\{ children \}\)/({ children }: { children: React.ReactNode })/g' "$file" > "$TEMP_FILE"
    mv "$TEMP_FILE" "$file"
    
    # Pattern 3: React.FC<Props> where Props doesn't include children
    # This requires manual review, so we'll mark it
    if grep -q "React\.FC<[^>]*>" "$file"; then
        echo -e "  ${YELLOW}⚠️  Manual review needed - custom Props interface${NC}"
    fi
    
    # Pattern 4: Remove React.FC with no props
    sed -E 's/: React\.FC = \(\)/(): React.ReactElement/g' "$file" > "$TEMP_FILE"
    mv "$TEMP_FILE" "$file"
    
    # Add React import if missing and React.ReactNode is used
    if grep -q "React\.ReactNode" "$file" && ! grep -q "import React" "$file"; then
        # Add React import at the top
        TEMP_FILE=$(mktemp)
        echo "import React from 'react';" > "$TEMP_FILE"
        cat "$file" >> "$TEMP_FILE"
        mv "$TEMP_FILE" "$file"
        echo -e "  ${GREEN}✓ Added React import${NC}"
    fi
    
    MIGRATED_COUNT=$((MIGRATED_COUNT + 1))
    echo -e "  ${GREEN}✓ Migrated${NC}"
    echo ""
done <<< "$AFFECTED_FILES"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Migration Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Statistics:${NC}"
echo "  - Files processed: $MIGRATED_COUNT"
echo "  - Backup location: $BACKUP_DIR"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Review the changes:"
echo "   git diff frontend/src"
echo ""
echo "2. Check for files that need manual review:"
echo "   grep -r 'React.FC' frontend/src"
echo ""
echo "3. Look for custom Props interfaces that need updating:"
echo "   grep -r 'React.FC<.*Props' frontend/src"
echo ""
echo "4. Test the application:"
echo "   cd frontend && npm run dev"
echo ""
echo "5. Run tests:"
echo "   cd frontend && npm test"
echo ""
echo "6. If issues occur, restore from backup:"
echo "   rm -rf frontend/src && cp -r $BACKUP_DIR frontend/src"
echo ""

echo -e "${YELLOW}⚠️  Common Issues to Check:${NC}"
echo ""
echo "1. Components with custom Props interfaces:"
echo "   ❌ const MyComponent: React.FC<MyProps> = (props) => {...}"
echo "   ✅ function MyComponent(props: MyProps): React.ReactElement {...}"
echo ""
echo "2. Components with optional children:"
echo "   ❌ React.FC (children was implicit)"
echo "   ✅ Explicitly type children in Props interface"
echo ""
echo "3. Components that return null:"
echo "   ❌ React.FC allowed null returns"
echo "   ✅ Use React.ReactElement | null as return type"
echo ""

echo -e "${GREEN}Migration script completed!${NC}"
echo ""
echo -e "${BLUE}For detailed migration guide, see ISSUE #2 in IRON-X_PROJECT_AUDIT.md${NC}"
