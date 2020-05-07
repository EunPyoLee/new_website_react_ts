import React from 'react';
import Matter from 'matter-js';



function percentXtoRender(percent, renderWidth) {
  return (percent / 100 * renderWidth);
}

function percentYtoRender(percent, renderHeight) {
  return (percent / 100 * renderHeight);
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    console.log('props');
    console.log(this.props);
    // this.state = {
    //   isUserTurn: true,
    //   lastUserTurnTime: Date.now(),
    //   lastCompTurnTime: Date.now()
    // };
  }

  componentDidMount() {
    var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Events = Matter.Events,
      Constraint = Matter.Constraint,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Bodies = Matter.Bodies;

    var engine = Engine.create(),
      world = engine.world;


    // create renderer
    let renderWidth = 900;
    let renderHeight = 600;
    let render = Render.create({
      canvas: document.querySelector('#gameCanvas'),
      engine: engine,
      options: {
        width: renderWidth,
        height: renderHeight,
        wireframes: false
      }
    });

    Render.run(render);
    var runner = Runner.create();
    Runner.run(runner, engine);

    const ground = Bodies.rectangle(renderWidth / 2.0, renderHeight + 110, renderWidth * 50, 200, { isStatic: true });
    ground.label = "ground";
    const user = Bodies.trapezoid(percentXtoRender(10, renderWidth), percentYtoRender(94, renderHeight), 40, 100, 0.3, { isStatic: true });
    const comp = Bodies.trapezoid(percentXtoRender(100, renderWidth), percentYtoRender(94, renderHeight), 40, 100, 0.3, { isStatic: true });
    user.collisionFilter.group = -1;
    user.label = "user";
    comp.collisionFilter.group = -2;
    comp.label = "comp";
    let rockOptions = { density: 0.004, restitution: 0.4 };
    let rock1 = Bodies.circle(percentXtoRender(10, renderWidth), percentYtoRender(80, renderHeight), 8, rockOptions);
    rock1.label = "userRock";
    rock1.collisionFilter.group = -1;
    let anchor1 = { x: percentXtoRender(10, renderWidth), y: percentYtoRender(80, renderHeight) };
    let elastic1 = Constraint.create({
      pointA: anchor1,
      bodyB: rock1,
      stiffness: 0.06
    });
    let rock2 = Bodies.circle(percentXtoRender(100, renderWidth), percentYtoRender(80, renderHeight), 8, rockOptions);
    rock2.label = "compRock";
    rock2.collisionFilter.group = -2;
    let anchor2 = { x: percentXtoRender(100, renderWidth), y: percentYtoRender(80, renderHeight) };
    let elastic2 = Constraint.create({
      pointA: anchor2,
      bodyB: rock2,
      stiffness: 0.06
    });
    Matter.Body.setStatic(rock2, true);

    let isUserTurn = true;
    const ground2 = Bodies.rectangle(percentXtoRender(55, renderWidth), percentYtoRender(80, renderHeight), 15, 400, { isStatic: true, isSensor: false });
    World.add(engine.world, [ground, ground2, user, comp, rock1, rock2, elastic1, elastic2]);
    var collision = Matter.SAT.collides(rock1, ground);
    if (collision.collided) {
      console.log("Hi");
    }


    Events.on(engine, 'afterUpdate', function () {
      if (mouseConstraint.mouse.button === -1 && (Math.abs(rock1.position.x - percentXtoRender(10, renderWidth)) > 5 || Math.abs(rock1.position.y - percentYtoRender(80, renderHeight)) > 5)) {
        rock1 = Bodies.circle(percentXtoRender(10, renderWidth), percentYtoRender(80, renderHeight), 8, rockOptions);
        // World.add(engine.world, rock);
        elastic1.bodyB = rock1;
      }
      if (mouseConstraint.mouse.button === -1 && (Math.abs(rock2.position.x - percentXtoRender(100, renderWidth)) > 5 || Math.abs(rock2.position.y - percentYtoRender(80, renderHeight)) > 5)) {
        rock2 = Bodies.circle(percentXtoRender(100, renderWidth), percentYtoRender(80, renderHeight), 8, rockOptions);
        // World.add(engine.world, rock);
        elastic2.bodyB = rock2;
      }
    });
    let lastUserTurnTime = Date.now() - 3000;
    let lastCompTurnTime = Date.now();

    Events.on(engine, 'collisionStart', function (event) {
      let pairs = event.pairs;
      console.log(pairs[0]);
      if (pairs[0].bodyA.label === "ground" || pairs[0].bodyB.label === "ground" ||
        pairs[0].bodyA.label === "user" || pairs[0].bodyB.label === "comp" 
        || pairs[0].bodyA.label === "comp" || pairs[0].bodyB.label === "user") {
        const groundCase = (pairs[0].bodyA.label === "ground" || pairs[0].bodyB.label === "ground");

        if (!groundCase) {
          if (isUserTurn && Math.abs(lastUserTurnTime - Date.now()) > 3100) {
            console.log('props after hit');
            this.props.updateHp(true);
          }
          else if (!isUserTurn && Math.abs(lastCompTurnTime - Date.now()) > 3100) {
            console.log('props after hit');
            this.props.updateHp(false);
          }
        }
        else if ((isUserTurn && Math.abs(lastUserTurnTime - Date.now()) > 3100) ||
          (!isUserTurn && Math.abs(lastCompTurnTime - Date.now()) > 3100)) {
          let thrownRock = pairs[0].bodyA.label === "ground" || "user" || "comp" ? pairs[0].bodyB : pairs[0].bodyA;
          let ballLabel = thrownRock.label;
          setTimeout(function () {
            World.remove(engine.world, thrownRock);
            if (isUserTurn && ballLabel === "userRock" && Math.abs(lastUserTurnTime - Date.now()) > 3100) {
              isUserTurn = false;
              lastUserTurnTime = Date.now();
              rock1 = Bodies.circle(percentXtoRender(10, renderWidth), percentYtoRender(80, renderHeight), 8, rockOptions);
              Matter.Body.setStatic(rock1, true);
              Matter.Body.setStatic(rock2, false);
              rock1.label = "userRock";
              rock1.collisionFilter.group = -1;
              World.add(engine.world, rock1);
              elastic1.bodyB = rock1;

            } else if (!isUserTurn && ballLabel === "compRock" && Math.abs(lastCompTurnTime - Date.now()) > 3100) {
              isUserTurn = true;
              lastCompTurnTime = Date.now();
              rock2 = Bodies.circle(percentXtoRender(100, renderWidth), percentYtoRender(80, renderHeight), 8, rockOptions);
              Matter.Body.setStatic(rock2, true);
              Matter.Body.setStatic(rock1, false);
              rock2.label = "compRock";
              rock2.collisionFilter.group = -2;
              World.add(engine.world, rock2);
              elastic2.bodyB = rock2;
            }
            console.log("remove printout\n");
          }, 3000);
        }

      }
    }.bind(this));



    // add mouse control
    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      }
      );

    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
      position: { x: 500, y: 500 },
      min: { x: 0, y: 0 },
      max: { x: 1000, y: 600 }
    }
    );



  }

  render() {
    return <div ref="scene" />;
  }

}

export default Game;
