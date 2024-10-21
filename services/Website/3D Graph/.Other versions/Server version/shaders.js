//Shader Parameters
var l_resolution; var l_parameters; var l_cameraPosition; var l_cameraRotation; var l_cameraZoom;
//Vertex Shader
var vertexShaderSource = `
    attribute vec3 position;
    void main() {
        gl_Position = vec4(position,1);
    }
`;
//FragmentShaders
var fragmentShaderSourceStart = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec3 parameters;
    uniform vec3 c_position;
    uniform vec3 c_offset;
    uniform vec2 c_rotation;
    uniform float zoom;
    uniform float variables[10];

    float f(vec3 point){
        float A = variables[0];
        float x = point.x; float y = point.y; float z = point.z;
        return 
`;
var fragmentShaderSourceEnd = `;
    }

    vec3 calcRayDir(vec2 pos, vec2 res){
        //calc starting vector
        float x = (res.x + res.y) / 5.0 * (zoom + 1.0);
        float y = pos.x - (res.x / 2.0);
        float z = pos.y - (res.y / 2.0);

        //rotation along y axis
        float Cos = cos(c_rotation.y); float Sin = sin(c_rotation.y);
        float xR = x*Cos - z*Sin; float zR = x*Sin + z*Cos;

        //rotation along z axis
        Cos = cos(c_rotation.x); Sin = sin(c_rotation.x);
        float xR2 = xR*Cos - y*Sin; float yR = xR*Sin + y*Cos;

        return normalize(vec3(xR2,yR,zR));
    }

    vec3 calcPoint(vec3 dir){
        vec3 point = c_position;
        float d = parameters.x;
        for(int i = 0; i < 10000; i++){
            if(i >= int(parameters.y)) break;
            float value = f(point);
            if(abs(value) < parameters.z){ return point;}
            //movePoint
            float dS = d;
            point = point + dir * dS;
        }
        return vec3(0.0, 0.0, 0.0);
    }

    vec3 calcNormal(vec3 point){
        float d = 0.00001; float x = point.x; float y = point.y; float z = point.z;
        float dX = f(point-vec3(+d,  0,  0)) - f(point-vec3(-d,  0,  0));
        float dY = f(point-vec3( 0, +d,  0)) - f(point-vec3( 0, -d,  0));
        float dZ = f(point-vec3( 0,  0, +d)) - f(point-vec3( 0,  0, -d));
        return normalize(vec3(dX, dY, dZ));
    }

    void main() {
        //Calculate Ray Direction based on x,y pixel coord
        vec3 dir = calcRayDir(gl_FragCoord.xy, u_resolution);
        //Calculate closest point to shape in Direction
        vec3 point = calcPoint(dir);
        //If Point undefined color is black
        if(point == vec3(0.0, 0.0, 0.0)){gl_FragColor = vec4(0,0,0,1); return;}
        //Calculate Normal
        //vec3 normal = calcNormal(point);
        //Calculate color based on lightDir
        float depth = length(c_position-point);
        float r = length(c_position);
        float col = r / (depth*depth);
        //Set color
        gl_FragColor = vec4(col,col,col, 0.5);
    }
`;
var linesFragmentShaderSource = `
    precision highp float;
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 0.5);
    }
`;