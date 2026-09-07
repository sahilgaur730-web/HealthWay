import os

def write_file(rel_path, content):
    full_path = os.path.join(r'C:\Users\SAHIL GAUR\Desktop\HealthWay', rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as fp:
        fp.write(content.strip() + '\n')
    print(f'WROTE: {rel_path} ({len(content)} chars)')

if __name__ == '__main__':
    print('write_files helper ready')
