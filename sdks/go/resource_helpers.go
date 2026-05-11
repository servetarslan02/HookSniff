package hooksniff

import (
	"encoding/json"
	"strconv"
)

func jsonUnmarshal(data []byte, v interface{}) error {
	return json.Unmarshal(data, v)
}

func itoa(i int) string {
	return strconv.Itoa(i)
}
