"use strict";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(other_point) {
        return Math.abs(this.x - other_point.x) < 0.00000001 &&
            Math.abs(this.y - other_point.y) < 0.00000001;
    }

    toString() {
        return `Point(${this.x}, ${this.y})`;
    }
}

class Cell {
    constructor(idx, x, y, width, height) {
        this.idx = idx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get_center() {
        return new Point(this.x + this.width / 2, this.y + this.height / 2);
    }
}

class Edge {
    constructor(first_point_idx,
        second_point_idx,
        first_point,
        second_point,
        weight) {
        this.first_point_idx = first_point_idx;
        this.second_point_idx = second_point_idx;
        this.first_point = first_point;
        this.second_point = second_point;
        this.weight = weight;
    }

    equals(other_edge) {
        return this.first_point.equals(other_edge.first_point) &&
            this.second_point.equals(other_edge.second_point);
    }

    toString() {
        return `Edge(${this.first_point}, ${this.second_point})`;
    }
}

class UnionFind {
    constructor(n) {
        this.parents = new Array(n);
        for (let i = 0; i < n; i++) {
            this.parents[i] = i;
        }
        console.log(this.parents);
    }

    find(x) {
        let current = x;
        while (this.parents[current] != current) {
            current = this.parents[current];
        }
        return current;
    }

    union(first, second) {
        let first_parent = this.find(first);
        let second_parent = this.find(second);
        this.parents[second_parent] = first_parent;
    }
}

const ROWS = 20;
const COLS = 20;
let COUNT = ROWS * COLS;

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");
const width = window.innerWidth;
const height = window.innerHeight;

const cell_width = width / COLS;
const cell_height = height / ROWS;

console.log(`cell width ${cell_width}`);
console.log(`cell height ${cell_height}`);

let x = 0;
let y = 0;
let drawn = 0;
let row = 1;

function get_initial_maze_cells() {
    let row_cells = [];
    const cells = [];
    let cell_idx = 0;

    for (let i = 0; i < COUNT; i++) {
        // ctx.fillStyle = `rgba(${randomInteger()},${randomInteger()},${randomInteger()},${Math.random() * 0.4})`;
        // ctx.fillRect(x, y, square_width, square_height);
        row_cells.push(new Cell(cell_idx++, x, y, cell_width, cell_height));
        x += cell_width;
        drawn++;
        if (drawn >= COLS) {
            x = 0;
            drawn = 0;
            cells.push(row_cells);
            row_cells = [];
            y = row++ * cell_height;
        }
        // console.log(`${x} ${y}`);
    }
    return cells;
}

function get_maze_edges(cells) {
    let edges = [];
    const dir_x = [-1, 0, 0, 1];
    const dir_y = [0, -1, 1, 0];
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            let current_cell = cells[i][j];
            for (let dir_idx = 0; dir_idx < dir_x.length; dir_idx++) {
                const neigbor_x = i + dir_x[dir_idx];
                const neigbor_y = j + dir_y[dir_idx];
                if (neigbor_x < 0 || neigbor_y < 0 || neigbor_x >= cells.length || neigbor_y >= cells[0].length) {
                    continue;
                }
                const neigbor_cell = cells[neigbor_x][neigbor_y];
                const current_cell_center = current_cell.get_center();
                const neigbor_cell_center = neigbor_cell.get_center();
                edges.push(new Edge(current_cell.idx, neigbor_cell.idx, current_cell_center, neigbor_cell_center, get_random_weight()));
            }
        }
    }
    return edges;
}

// draw maze's edges
function draw_edges_all_at_once(edges) {
    console.log(edges);
    // for (let edge of edges) {
    //     console.log(`Edge -> ${edge.first_point} ${edge.second_point}`);
    // }

    for (let edge of edges) {
        ctx.beginPath(); // Start a new path
        ctx.strokeStyle = "white";
        ctx.moveTo(edge.first_point.x, edge.first_point.y); // Move the pen to (30, 50)
        ctx.lineTo(edge.second_point.x, edge.second_point.y); // Draw a line to (150, 100)
        ctx.stroke(); // Render the path
    }
    return edges;
}

function draw_edges_one_by_one(edges) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let idx = 0;
    setInterval(() => {
        console.log(`idx: ${idx}`);
        let edge = edges[idx++];
        ctx.beginPath(); // Start a new path
        ctx.strokeStyle = "white";
        ctx.moveTo(edge.first_point.x, edge.first_point.y); // Move the pen to (30, 50)
        ctx.lineTo(edge.second_point.x, edge.second_point.y); // Draw a line to (150, 100)
        ctx.stroke(); // Render the path
    }, 10);
}

function remove_duplicate_edges(raw_edges) {
    const edges = [];

    for (let edge of raw_edges) {
        let duplicate = false;
        for (let i = 0; i < edges.length; i++) {
            if (edges[i].equals(edge)) {
                duplicate = true;
                break;
            }
        }
        if (!duplicate) {
            edges.push(edge);
        }
    }

    console.log(`After removing duplicates ${edges}`);

    return edges;
}

function mst_kruskal(edges) {
    edges.sort((a, b) => a.weight - b.weight);
    const mst_edges = [];

    const uf = new UnionFind(COUNT);

    mst_edges.push(edges[0]);
    for (let i = 1; i < edges.length; i++) {
        let edge = edges[i];
        if (uf.find(edge.first_point_idx) == uf.find(edge.second_point_idx)) {
            continue;
        }
        uf.union(edge.first_point_idx, edge.second_point_idx);
        mst_edges.push(edge);
    }

    console.log(mst_edges);
    return mst_edges;
}

let edges = remove_duplicate_edges(get_maze_edges(get_initial_maze_cells()));
draw_edges_one_by_one(mst_kruskal(draw_edges_all_at_once(edges)));

function get_random_weight(max = 1000) {
    return Math.floor(Math.random() * max);
}