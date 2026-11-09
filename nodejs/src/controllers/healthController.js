class HealthController {
  /**
   * Health check endpoint.
   */
  check(req, res) {
    return res.json({ status: 'ok' });
  }
}

const healthController = new HealthController();

module.exports = healthController;
