import os
import re

def process_class_string(class_str):
    if not class_str:
        return class_str
    
    classes = class_str.split()
    new_classes = []
    has_card = False
    
    for c in classes:
        # Remove rounded
        if c.startswith('rounded-') or 'shadow-' in c:
            continue
        
        # Replace backgrounds
        if c.startswith('bg-[#'):
            new_classes.append('bg-card')
            has_card = True
        elif c == 'border-white/10' or c == 'border-white/5' or c == 'border-white/20':
            new_classes.append('border-border')
            new_classes.append('border-2')
        elif 'text-zinc-' in c:
            new_classes.append('text-muted-foreground')
        elif 'bg-blue-' in c or 'bg-purple-' in c:
            new_classes.append('bg-primary')
            new_classes.append('text-primary-foreground')
        else:
            new_classes.append(c)
            
    if has_card and 'brut-card' not in new_classes:
        new_classes.append('brut-card')
        
    # Deduplicate keeping order
    seen = set()
    final_classes = []
    for c in new_classes:
        if c not in seen:
            seen.add(c)
            final_classes.append(c)
            
    return " ".join(final_classes)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find className="..."
    def replace_double_quote(match):
        orig_classes = match.group(1)
        new_classes = process_class_string(orig_classes)
        return f'className="{new_classes}"'

    content = re.sub(r'className="([^"]+)"', replace_double_quote, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
