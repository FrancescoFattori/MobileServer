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
    uniform vec3 c_position;
    uniform vec3 c_offset;
    uniform vec2 c_rotation;
    uniform float options[11];
    uniform float variables[10];
    uniform vec3 backColor;
    uniform vec3 color1;
    uniform vec3 color2;

    #define step options[0]
    #define maxIter options[1]
    #define precision options[2]
    #define algorithm options[3]
    #define viewGrid options[4]
    #define colorIter options[5]
    #define perspective options[6]
    #define zoom options[7]
    #define lighting options[8]
    #define limitRadius options[9]
    #define reverseLight options[10]

    #define pi   3.14159265
    #define e    2.71828182
    #define phi  1.61803398

    #define A  variables[0]
    #define B  variables[1]
    #define C  variables[2]
    #define D  variables[3]
    #define E  variables[4]
    #define F  variables[5]
    #define G  variables[6]
    #define H  variables[7]
    #define I  variables[8]

    float f(vec3 point){
        float x = point.x; float y = -point.y; float z = point.z;
        return 
`;
var fragmentShaderSourceEnd = `;
    }

    vec3 r_dir = vec3(0.0, 0.0, 0.0);
    vec3 r_pos = vec3(0.0, 0.0, 0.0);

    void calcDirAndPos(vec2 pos, vec2 res){
        if(perspective == 1.0){
            //calc starting vector
            float x = (res.x + res.y) / 5.0 * zoom;
            float y = pos.x - (res.x / 2.0);
            float z = pos.y - (res.y / 2.0);

            //rotation along y axis
            float Cos = cos(c_rotation.y); float Sin = sin(c_rotation.y);
            float xR = x*Cos - z*Sin; float zR = x*Sin + z*Cos;

            //rotation along z axis
            Cos = cos(c_rotation.x); Sin = sin(c_rotation.x);
            float xR2 = xR*Cos - y*Sin; float yR = xR*Sin + y*Cos;
            r_dir = normalize(vec3(xR2,yR,zR));
            r_pos = c_position;
        }else{
            //calc starting vector
            float x = 0.0;
            float y = pos.x - (res.x / 2.0);
            float z = pos.y - (res.y / 2.0);

            //rotation along y axis
            float Cos = cos(c_rotation.y); float Sin = sin(c_rotation.y);
            float xR = x*Cos - z*Sin; float zR = x*Sin + z*Cos;

            //rotation along z axis
            Cos = cos(c_rotation.x); Sin = sin(c_rotation.x);
            float xR2 = xR*Cos - y*Sin; float yR = xR*Sin + y*Cos;
            r_pos = c_position + vec3(xR2, yR, zR) / (res.x + res.y) * 20.0 / zoom;
            r_dir = normalize(-c_position);
        }
    }

    bool inSphereLimit(vec3 p){
        if(limitRadius>99.0)return true;
        return p.x*p.x + p.y*p.y + p.z*p.z - limitRadius < 0.0;
    }


    vec4 calcPoint(vec3 dir, vec3 pos){
        vec3 point = pos + dir * 0.2;
        vec3 endPoint = pos;
        float maxTravel = 0.0;
        bool inside = false;
        float d = step;
        //calc start and end point
        if(limitRadius < 99.0){
            float a = dir.x*dir.x + dir.y*dir.y + dir.z*dir.z;
            float b = 2.0 * (pos.x*dir.x + pos.y*dir.y + pos.z*dir.z);
            float c = pos.x*pos.x + pos.y*pos.y + pos.z*pos.z - limitRadius;
            float delta = b*b-4.0*a*c;
            if(delta >= 0.0){
                float t1 = (-b - sqrt(delta)) / (2.0 * a);
                float t2 = (-b + sqrt(delta)) / (2.0 * a);
                point = pos + dir * t1 * 1.01;
                maxTravel = t2;
                endPoint = pos + dir * maxTravel;
            }else{
                return vec4(0.0, 0.0, 0.0, step);
            }
        }
        //Standard
        if(algorithm == 1.0){
            for(int i = 0; i < 10000; i++){
                if(i >= int(maxIter)) break;
                float value = f(point);
                if(abs(value) < precision){
                    if(inSphereLimit(point))return vec4(point,i);
                    float v = f(endPoint);
                    if(abs(v) < precision)return vec4(endPoint,i);
                    break;
                }
                //movePoint
                float dS = d;
                point = point + dir * dS;
            }
        //Fast
        }else if(algorithm == 0.0){
            for(int i = 0; i < 10000; i++){
                if(i >= int(maxIter)) break;
                float value = f(point);
                if(abs(value) < precision){
                    if(inSphereLimit(point))return vec4(point,i);
                    float v = f(endPoint);
                    if(abs(v) < precision)return vec4(endPoint,i);
                    break;
                }
                //movePoint
                float dS = max(min(d * value, 2.0 * d),d * 0.5);
                point = point + dir * dS;
            }
        //Signed
        }else if(algorithm == 3.0){
            float mult = 2.0;
            float way = 1.0;
            float prevSign = -2.0;
            for(int i = 0; i < 10000; i++){
                if(i >= int(maxIter)) break;
                float value = f(point);
                if(abs(value) < precision / 2.0){
                    if(inSphereLimit(point))return vec4(point,i);
                    float v = f(endPoint);
                    if(abs(v) < precision / 2.0)return vec4(endPoint,i);
                    break;
                }
                float thisSign = sign(value); if(prevSign == -2.0){prevSign = thisSign;}
                if(thisSign != prevSign){mult = mult / 2.0; way = way * -1.0;}
                prevSign = thisSign;
                //movePoint
                float dS = d * mult * way;
                point = point + dir * dS;
            }
        //Fast Signed
        }else if(algorithm == 2.0){
            float mult = 2.0;
            float way = 1.0;
            float prevSign = -2.0;
            for(int i = 0; i < 10000; i++){
                if(i >= int(maxIter)) break;
                float value = f(point);
                if(abs(value) < precision / 2.0){
                    if(inSphereLimit(point))return vec4(point,i);
                    float v = f(endPoint);
                    if(abs(v) < precision / 2.0)return vec4(endPoint,i);
                    break;
                }
                float thisSign = sign(value); if(prevSign == -2.0){prevSign = thisSign;}
                if(thisSign != prevSign){mult = mult / 2.0; way = way * -1.0;}
                prevSign = thisSign;
                //movePoint
                float dS = d * mult * way;
                dS = max(min(dS * value, 2.0 * dS),dS * 0.5);
                point = point + dir * dS;
            }
        }
        return vec4(0.0, 0.0, 0.0, step);
    }

    vec3 SDFplane(vec3 dir, vec3 pos){
        vec3 point = pos;
        if(point.z * dir.z >= 0.0 && perspective == 1.0){ return vec3(0.0,0.0,0.0); }
        float mult = -point.z / dir.z;
        point = point + dir * mult;
        if(length(point) > 20.0){ return vec3(0.0,0.0,0.0); }
        return point;
    }

    vec3 calcNormal(vec3 point){
        float d = 0.001;
        float dX = f(point-vec3(+d,  0,  0)) - f(point-vec3(-d,  0,  0));
        float dY = f(point-vec3( 0, +d,  0)) - f(point-vec3( 0, -d,  0));
        float dZ = f(point-vec3( 0,  0, +d)) - f(point-vec3( 0,  0, -d));
        return normalize(vec3(dX, dY, dZ));
    }

    void main() {
        //Calculate Ray Direction based on x,y pixel coord and starting position
        calcDirAndPos(gl_FragCoord.xy, u_resolution);
        float axisCol = 0.0;
        if(viewGrid == 1.0){
            vec3 axisPoint = SDFplane(r_dir, r_pos);
            if(axisPoint != vec3(0.0, 0.0, 0.0)){
                float axisDepth = length(c_position - axisPoint);
                axisCol = (mod(floor(axisPoint.x) + floor(axisPoint.y), 2.0) * 2.0 - 1.0) / 5.0;
                if(abs(axisPoint.x) < 0.01 && abs(axisPoint.z) < 0.01){ axisCol = 0.75;}
                if(abs(axisPoint.y) < 0.01 && abs(axisPoint.z) < 0.01){ axisCol = 0.75;}
                if(abs(axisPoint.x) < 0.04 && abs(axisPoint.z) < 0.04 && abs(axisPoint.y-floor(axisPoint.y+0.5)) < 0.01){ axisCol = 0.75;}
                if(abs(axisPoint.y) < 0.04 && abs(axisPoint.z) < 0.04 && abs(axisPoint.x-floor(axisPoint.x+0.5)) < 0.01){ axisCol = 0.75;}
                axisCol = min(max(0.0, axisCol / axisDepth * 2.0),0.3);
            }
        }
        //Calculate closest point to shape in Direction
        vec4 point = calcPoint(r_dir, r_pos);
        //If Point undefined color is black
        if(point.xyz == vec3(0.0, 0.0, 0.0)){
            vec3 co = backColor-vec3(axisCol,axisCol,axisCol);
            gl_FragColor = vec4(co, 1); return;
        }
        //Calculate color based on depth
        vec3 norm = calcNormal(point.xyz);
        vec3 lightDir = normalize(vec3(1.0,-2.0,-4.0));
        if(reverseLight==1.0){lightDir*=-1.0;}
        float depth = length(c_position-point.xyz);
        float r = length(c_position);
        float col = 0.0;
        if(lighting == 1.0){
            col = 0.2 + 0.5 * (r / 2.5 / (depth + 1.0)) + 0.5 * (max(-0.2,dot(norm,lightDir)));
        }else{
            col = r / 2.5 / (depth + 1.0);
        }
        //Set color
        float signColor = sign(f(point.xyz - r_dir * 0.1));
        float c = axisCol / 10.0 + col;
        float iter = point.w / 500.0;
        vec3 color = vec3(c,c,c);
        if(colorIter != 0.0){ if(iter > 1.0) {gl_FragColor = vec4(1,1,1,1); return;} gl_FragColor = vec4(c*0.5+iter,c*0.5,c*0.5, 1.0); return;}
        if(signColor == 1.0){color *= color1;}
        if(signColor == -1.0){color *= color2;}
        gl_FragColor = vec4(color, 1.0);
    }
`;