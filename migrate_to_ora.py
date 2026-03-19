import os
import re

def smart_replace(match):
    original = match.group(0)
    # If it's all uppercase, return all uppercase ORA
    if original.isupper():
        return "ORA"
    # If it's Title Case, return all uppercase ORA (as per user request "new named 'ORA'")
    # but we might want to check if it's better as "Ora"
    # However, "ORA" is specified.
    if original[0].isupper():
        return "ORA"
    # If it's all lowercase, return lowercase ora (important for package names, bundle IDs)
    return "ora"

def process_content(root_dir):
    print(f"--- Replacing content in files under {root_dir} ---")
    for root, dirs, files in os.walk(root_dir):
        # Skip git and node_modules
        if '.git' in dirs:
            dirs.remove('.git')
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        
        for name in files:
            if name.endswith(('.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar.gz', '.jar', '.bin', '.exe', '.dll')):
                continue
            
            file_path = os.path.join(root, name)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Use regex with IGNORECASE and smart_replace
                new_content = re.sub(r'ora', smart_replace, content, flags=re.IGNORECASE)
                
                if content != new_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated: {file_path}")
            except (UnicodeDecodeError, PermissionError):
                # Skip files we can't read/write
                continue
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

def rename_paths(root_dir):
    print(f"\n--- Renaming files and directories under {root_dir} ---")
    # We use topdown=False to rename children before parents
    for root, dirs, files in os.walk(root_dir, topdown=False):
        # Skip git and node_modules
        if '.git' in root or 'node_modules' in root:
            continue
            
        # Rename files
        for name in files:
            if 'ora' in name.lower():
                new_name = re.sub(r'ora', smart_replace, name, flags=re.IGNORECASE)
                old_path = os.path.join(root, name)
                new_path = os.path.join(root, new_name)
                try:
                    os.rename(old_path, new_path)
                    print(f"Renamed file: {name} -> {new_name}")
                except Exception as e:
                    print(f"Error renaming file {old_path}: {e}")
        
        # Rename directories
        for name in dirs:
            if 'ora' in name.lower():
                # Skip .git and node_modules
                if name in ('.git', 'node_modules'):
                    continue
                new_name = re.sub(r'ora', smart_replace, name, flags=re.IGNORECASE)
                old_path = os.path.join(root, name)
                new_path = os.path.join(root, new_name)
                try:
                    os.rename(old_path, new_path)
                    print(f"Renamed dir: {name} -> {new_name}")
                except Exception as e:
                    print(f"Error renaming dir {old_path}: {e}")

if __name__ == "__main__":
    # Get the project root directory
    project_root = "/home/unshakensoul/Documents/Projects and Notes/Projects/ora"
    
    # Confirm with user or just run?
    # I'll just run it as requested.
    process_content(project_root)
    rename_paths(project_root)
    print("\nMigration to ORA completed.")
