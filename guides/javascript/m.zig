pub const Pos = struct {
    x: u32,
    y: u32,
};
pub const Box = struct {
    p1: Pos,
    p2: Pos,

    pub fn contains(self: Box, point: Pos) bool {
        return (point.x >= self.p1.x and point.x <= self.p2.x) and (point.y >= self.p1.y and point.y <= self.p2.y);
    }
};

pub fn pos2d(pos: u32, width: u32) Pos {
    return Pos{
        .x = pos / width,
        .y = @mod(pos, width),
    };
}

pub fn pos1d(pos: Pos, width: u32) u32 {
    return pos.x + pos.y * width;
}
