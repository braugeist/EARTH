import base64
from selenium import webdriver

driver = webdriver.Firefox()
driver.set_window_size(450, 535)
driver.get("http://localhost:8080/")

def snap(i):
    # Get the canvas as a JPEG base64 string.
    script = \
    '''
    var callback = arguments[arguments.length - 1];
    snapTile(%d, callback);
    '''%i
    canvas_base64 = driver.execute_async_script(script)

    # Decode base64.
    l = len('data:image/jpeg;base64,')
    canvas_jpeg = base64.b64decode(canvas_base64[l:])

    # Save to a file.
    with open("../tmp/metadata/image/tile%d.jpeg"%i, 'wb') as f:
        f.write(canvas_jpeg)

for i in range(812):
    snap(i)

driver.close()
