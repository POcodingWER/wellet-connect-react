//  문제
// x 좌표와 y 좌표가 모두 양수이면 제1사분면에 속합니다.
// x 좌표가 음수, y 좌표가 양수이면 제2사분면에 속합니다.
// x 좌표와 y 좌표가 모두 음수이면 제3사분면에 속합니다.
// x 좌표가 양수, y 좌표가 음수이면 제4사분면에 속합니다.

function solution(dot) {
    if(dot[0]>0 && dot[1]>0)return 1;
    if(dot[0]<0 && dot[1]>0)return 2;
    if(dot[0]<0 && dot[1]<0)return 3;
    if(dot[0]>0 && dot[1]<0)return 4;
}


function solution(dot) {
    return dot[0] > 0 ? dot[1] > 0 ? 1 : 4 : dot[1] > 0 ? 2 : 3;
}