import os
import re

def remove_comments(content):
    # Regex logic:
    # 1. Strings: "..." or '...' or `...`
    # 2. Block comments: /* ... */
    # 3. Line comments: // ... (until end of line)
    # We must ensure dot (.) does NOT match newline for // comments
    
    # Pattern explanation:
    # Group 1 (Strings):  (\".*?\"|\'.*?\'|`[^`]*`)  -> match strings, using non-greedy where approp. 
    #                     For backticks, we use [^`]* because they can be multiline, so . isn't enough unless DOTALL, but we don't want DOTALL for //
    # Group 2 (Block):    (\/\*[\s\S]*?\*\/)        -> [\s\S] matches any char including newline (simulating DOTALL for this part)
    # Group 3 (Line):     (\/\/.*)                  -> matches // until end of line (standard . excludes newline)
    
    pattern = r'(\".*?\"|\'.*?\'|`[^`]*`)|(\/\*[\s\S]*?\*\/)|(\/\/.*)'
    
    def replacer(match):
        # If it's a string (group 1), return it as is
        if match.group(1):
            return match.group(1)
        # If it's a comment (group 2 or 3), return empty string
        return ""

    return re.sub(pattern, replacer, content)

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = remove_comments(content)
        
        # Only write if changed
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Processed: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    target_dir = os.path.join(os.getcwd(), 'src')
    extensions = ('.ts', '.tsx', '.js', '.jsx')
    
    print(f"Scanning {target_dir} for {extensions} files...")
    
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith(extensions):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
