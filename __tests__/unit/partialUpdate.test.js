const sqlForPartialUpdate = require('../../helpers/partialUpdate')

describe("partialUpdate()", () => {
  test("should generate a proper partial update query with just 1 field", function () {
    const response = sqlForPartialUpdate('companies', { 'logo_url': 'dogs', 'name': 'daniel' }, 'handle', 'cool')

    // FIXME: write real tests!
    expect(response).toEqual({
      query: `UPDATE companies SET logo_url=$1, name=$2 WHERE handle=$3 RETURNING *`,
      values: ['dogs', 'daniel', 'cool']
    });

  });
});
