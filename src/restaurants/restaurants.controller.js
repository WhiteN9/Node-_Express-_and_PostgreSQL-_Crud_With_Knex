const restaurantsService = require("./restaurants.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const hasRequiredProperties = hasProperties("restaurant_name","cuisine", "address")

async function restaurantExists(req, res, next) {
  const { restaurantId } = req.params;

  const restaurant = await restaurantsService.read(restaurantId);

  if (restaurant) {
    res.locals.restaurant = restaurant;
    return next();
  }
  next({ status: 404, message: `Restaurant cannot be found.` });
}

async function list(req, res, next) {
  const data = await restaurantsService.list();
  res.json({ data });
}

async function create(req, res, next) {
//   console.log(req.body.data)
  const data = await restaurantsService.create(req.body.data);
  res.status(201).json({ data });
}

async function update(req, res, next) {
  const updatedRestaurant = {
    ...res.locals.restaurant,
    ...req.body.data,
    restaurant_id: res.locals.restaurant.restaurant_id,
  };

  const data = await restaurantsService.update(updatedRestaurant);

  res.json({ data });
}

async function destroy(req, res, next) {
  await restaurantsService.delete(res.locals.restaurant.restaurant_id);
  res.status(204).json({ data: {} });
}

const VALID_PROPERTIES = [
  "restaurant_name","cuisine","address"
]

function hasOnlyValidProperties(req,res,next) {
//   const bodyproperties = req.body.data;
  const {data = {}} = req.body //better with default
  const invalidFields = Object.keys(data).filter((property) => !VALID_PROPERTIES.includes(property));
  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    })
  }
  next();
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [hasRequiredProperties, hasOnlyValidProperties,  asyncErrorBoundary(create)],
  update: [asyncErrorBoundary(restaurantExists), asyncErrorBoundary(update)],
  delete: [asyncErrorBoundary(restaurantExists), asyncErrorBoundary(destroy)],
};
